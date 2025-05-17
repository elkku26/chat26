mod shared_types;
mod internal_types;

use axum::{Router};
use std::{
    collections::HashMap,
    env,
    net::SocketAddr,
    sync::{Arc, Mutex},
};
use axum::extract::{State};
use axum::http::{Method, StatusCode};
use crate::shared_types::{ChatMessage, CreateUserPayload, CreateUserResponsePayload, ForwardChatPayload, JoinRoomPayload, SendChatPayload, SendChatResponsePayload, Status, User, UserJoinedPayload, WSClientMessage, WSClientMessageKind, WSServerMessage, WSServerMessageKind};
use futures_channel::mpsc::{UnboundedSender, unbounded};
use futures_util::{StreamExt, future, pin_mut, stream::TryStreamExt};
use tokio::join;
use tokio::net::{TcpListener, TcpStream};
use tokio_tungstenite;
use uuid::Uuid;
use crate::internal_types::AppState;
use chrono::prelude::*;
use tower_http::cors::CorsLayer;

type Tx = UnboundedSender<tungstenite::protocol::Message>;
/// PeerMap maps internet socket addresses to the sender half of the unbounded channel, allowing the server to send messages through the channel based on the socket addresses
type PeerMap = Arc<Mutex<HashMap<SocketAddr, Tx>>>;
type ProtectedAppState = Arc<Mutex<AppState>>;




//helpers
fn insert_peer(peer_map_ref: &PeerMap, addr: SocketAddr, tx: Tx) {
    let mut peer_map_lock = peer_map_ref.lock().unwrap();
    peer_map_lock.insert(addr, tx);
}



//REST implementations
async fn get_messages(State(state): State<ProtectedAppState>) -> String {
    println!("get messages");
    let state_lock = state.lock().unwrap(); //this fails with poisonerror
    let messages = &state_lock.messages;
    println!("{}", serde_json::to_string(messages).unwrap());

    serde_json::to_string(messages).unwrap()
}

async fn post_user(State(state): State<ProtectedAppState>, axum::Json(payload): axum::Json<CreateUserPayload>) -> String {
    println!("post user");
    let mut state_lock = state.lock().unwrap();
    let response = CreateUserResponsePayload{ uuid: String::from(Uuid::new_v4())};
    let user : User = User {username: payload.username, id: response.uuid.clone(), created_at: Utc::now().to_string(), status: Status::Online };
    state_lock.room_members.push(user);
    serde_json::to_string(&response).unwrap()
}


async fn rest_root() -> &'static str {
    "hello there!"
}


async fn handle_websocket_connection(peer_map: PeerMap, raw_stream: TcpStream, addr: SocketAddr, app_state: ProtectedAppState) {
    println!("Incoming TCP connection from: {}", addr);


    //accept async creates a WebSocketStream from the TcpStream, basically turning the raw tcp stream into a WS connection
    let ws_stream = tokio_tungstenite::accept_async(raw_stream)
        .await
        .expect("Error during the websocket handshake occurred");
    println!("WebSocket connection established: {}", addr);

    //unbounded returns an unbounded sender tx and unbounded receiver rx
    //unbounded means that the channel is only bounded by the available memory
    let (tx, rx) = unbounded();


    let hashmap_ref = &peer_map;
    insert_peer(hashmap_ref, addr, tx.clone());

    //split the ws stream into incoming and outgoing

    let (outgoing, incoming) = ws_stream.split();

    let handle_incoming = incoming.try_for_each(|msg| {
        //interesting implementation detail here: serialized is of type &str apparently because it's pointing to the data owned by the tungsten::Message
        let serialized = msg.to_text().unwrap();

        println!("Received a message from {}: {}", addr, serialized);

        let deserialized: WSClientMessage = serde_json::from_str(serialized).unwrap();
        
        //broadcast event to other members in the chat
        let peers = peer_map.lock().unwrap();
        let broadcast_recipients = peers
            .iter()
            .filter(|(peer_addr, _)| peer_addr != &&addr)
            .map(|(_, ws_sink)| ws_sink);

        
        match deserialized.kind {
            WSClientMessageKind::SendChat => {
                //validate the payload shape
                //todo error handling here? unwrap just panics on error I think
                let payload: SendChatPayload =
                    serde_json::from_value(deserialized.payload).unwrap();
                
                
                let new_chat = ChatMessage {
                    id: String::from(Uuid::new_v4()),
                    created_at: Utc::now().to_string(),
                    content: payload.content,
                    sender_id: payload.sender_id
                };

                
                //send the ForwardChat msg to all the recipients
                for recp in broadcast_recipients {
                    // .into() on a &str is the same as String::from("somestring")
                    let peer_payload: ForwardChatPayload = ForwardChatPayload {
                        chat_message: new_chat.clone()
                    }; //todo check if implementing clone for the payload type actually makes sense
                    let peer_message: WSServerMessage = WSServerMessage {
                        id: String::from(Uuid::new_v4()),
                        kind: WSServerMessageKind::ForwardChat,
                        payload: serde_json::json!(peer_payload),
                    };
                    let peer_tungsten_message =
                        tungstenite::protocol::Message::from(serde_json::to_string(&peer_message).unwrap());
                    match recp.unbounded_send(peer_tungsten_message.clone()) {
                        Ok(_) => {println!("Succesfully broadcasted")},
                        Err(error) => { eprintln!("oh noes")}
                    };
                }
                
                //send the sendchatresponse to the client
                let payload = serde_json::json!(SendChatResponsePayload {chat_message: new_chat});
                let message = WSServerMessage {
                    kind: WSServerMessageKind::SendChatResponse,
                    id: deserialized.id,
                    payload
                };
                
                let serialized_response = tungstenite::protocol::Message::from(serde_json::to_string(&message).unwrap());
                
                match tx.unbounded_send(serialized_response) {
                    Ok(_) => {println!("succesfully responded")},
                    Err(error) => {eprintln!("error")}
                }
                
                
                
                println!("sendchat, payload is {}", serialized);




            }
            WSClientMessageKind::JoinRoom => {
                println!("joinroom, payload is {}", serialized);

                let payload: JoinRoomPayload =
                    serde_json::from_value(deserialized.payload).unwrap();

                for recp in broadcast_recipients {
                // .into() on a &str is the same as String::from("somestring")
                
                    let state_lock = app_state.lock().unwrap();
                    let user = state_lock.room_members.iter().find(|&u| u.id == payload.user_id).unwrap();
                    let peer_payload: UserJoinedPayload = UserJoinedPayload {user: user.clone()};
                    
                    let peer_message: WSServerMessage = WSServerMessage {
                    id: String::from(Uuid::new_v4()),
                    kind: WSServerMessageKind::UserJoined,
                    payload: serde_json::json!(peer_payload),
                };
                let peer_tungsten_message =
                    tungstenite::protocol::Message::from(serde_json::to_string(&peer_message).unwrap());
                match recp.unbounded_send(peer_tungsten_message.clone()) {
                    Ok(_) => {println!("Succesfully broadcasted")},
                    Err(error) => { eprintln!("oh noes")}
                };
            }


                
                
            }

        }

        future::ok(())
    });

    
    //todo: figure out what this boilerplate actually does
    let receive_from_others = rx.map(Ok).forward(outgoing);
    pin_mut!(handle_incoming, receive_from_others);
    future::select(handle_incoming, receive_from_others).await;

}



//entry point for tokio
#[tokio::main]
async fn main() {
    //arc allows multiple threads to "own" the object at the same time
    //mutex locks the data from other threads while it's being accessed
    let peer_map = PeerMap::new(Mutex::new(HashMap::new()));

    let message_state: Arc<Mutex<Vec<ChatMessage>>> = Arc::new(Mutex::new(vec![ChatMessage::new(
        String::from("Some-id"),
        String::from("2025-05-08T19:15:15Z"),
        String::from("hello"),
        String::from(Uuid::new_v4()),
    )]));

    

    let state = Arc::new(Mutex::new(AppState {messages: vec!{}, room_members: vec!{} }));

    //Arc::clone allows us to have access the state in both the REST and websocket functions
    let rest_state = Arc::clone(&state);

    let rest_addr = env::args()
        .nth(1)
        .unwrap_or_else(|| "127.0.0.1:9000".to_string());
    let rest_listener = TcpListener::bind(&rest_addr)
        .await
        .expect("Failed to bind REST");

    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_origin(tower_http::cors::Any)
        .allow_headers(tower_http::cors::Any);

    let app = Router::new()
        .route("/", axum::routing::get(rest_root))
        .route("/messages", axum::routing::get(get_messages))
        .route("/users", axum::routing::post(post_user))
        .with_state(rest_state) // Apply state to the entire router
        .layer(cors);

    let rest_server = async {
        println!("Listening for REST on: {}", rest_addr);
        axum::serve(rest_listener, app).await.unwrap();
    };


    //pay attention to the ports here when doing docker stuff
    let ws_addr = env::args()
        .nth(1)
        .unwrap_or_else(|| "127.0.0.1:9001".to_string());
    let ws_listener = TcpListener::bind(&ws_addr)
        .await
        .expect("Failed to bind");
    println!("Listening for WS on: {}", ws_addr);

    //as long as listener.accept() returns ok, spawn new async task, which is defined by fn handle_websocket_connection
    let ws_server = async {
        while let Ok((stream, addr)) = ws_listener.accept().await {
            println!("New WebSocket connection: {}", addr);

            //it feels odd to clone the state for each connection like this
            //but this is the way the official tokio.rs tutorial does this
            //and remember that we're not cloning the state itself but actually just the arc pointer
            let state_handle = state.clone();
            let peer_map_handle = peer_map.clone();

            //here move captures the variables inside the block and moves them to the thread spawned with tokio::spawn
            tokio::spawn(async move {
                handle_websocket_connection(peer_map_handle, stream, addr, state_handle).await;
            });


        }
    };
    //join the endpoints
    join!(rest_server, ws_server);
}

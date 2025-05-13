mod shared_types;

use axum::Router;
use std::{
    collections::HashMap,
    env,
    net::SocketAddr,
    sync::{Arc, Mutex},
};

use crate::shared_types::{ChatMessage, SendChatPayload, WSClientMessage, WSClientMessageKind};
use futures_channel::mpsc::{UnboundedSender, unbounded};
use futures_util::{StreamExt, future, stream::TryStreamExt, pin_mut};
use tokio::join;
use tokio::net::{TcpListener, TcpStream};
use tokio_tungstenite::tungstenite::protocol::Message;
use tungstenite::Utf8Bytes;
use uuid::Uuid;

type Tx = UnboundedSender<Message>;

/// PeerMap maps internet socket addresses to the sender half of the unbounded channel, allowing the server to send messages through the channel based on the socket addresses
type PeerMap = Arc<Mutex<HashMap<SocketAddr, Tx>>>;

async fn handle_websocket_connection(peer_map: PeerMap, raw_stream: TcpStream, addr: SocketAddr) {
    println!("Incoming TCP connection from: {}", addr);

    //accept async creates a WebSocketStream from the TcpStream, basically turning the raw tcp stream into a WS connection
    let ws_stream = tokio_tungstenite::accept_async(raw_stream)
        .await
        .expect("Error during the websocket handshake occurred");
    println!("WebSocket connection established: {}", addr);

    //unbounded returns an unbounded sender tx and unbounded receiver rx
    //unbounded means that the channel is only bounded by the 
    let (tx, rx) = unbounded();

    //add the tcp address and the unbounded receiver to the peer map
    peer_map.lock().unwrap().insert(addr, tx);

    //split the ws stream into incoming and outgoing
    let (outgoing, incoming) = ws_stream.split();

    let handle_incoming = incoming.try_for_each(|msg| {
        
        //interesting implementation detail here: serialized is of type &str apparently because it's pointing to the data owned by the tungsten::Message
        let serialized = msg.to_text().unwrap();

        println!("Received a message from {}: {}", addr, serialized);

        let deserialized: WSClientMessage = serde_json::from_str(serialized).unwrap();

        match deserialized.kind {
            WSClientMessageKind::SendChat => {
                //validate the payload shape
                let data: SendChatPayload = serde_json::from_value(deserialized.payload).unwrap();

                //broadcast event to other members in the chat
                let peers = peer_map.lock().unwrap();
                let broadcast_recipients =
                    peers.iter().filter(|(peer_addr, _)| peer_addr != &&addr).map(|(_, ws_sink)| ws_sink);
                for recp in broadcast_recipients {
                    // .into() on a &str is the same as String::from("somestring")
                    let peer_message = Message::Text("peer message test".into());
                    recp.unbounded_send(peer_message.clone()).unwrap();
                }
                println!("sendchat, payload is {}", serialized);
                println!("chat message is {}", serde_json::to_string(&data).unwrap());
            }
            WSClientMessageKind::JoinRoom => {
                let data = deserialized.payload.clone();
                println!("joinroom, payload is {}", serialized);
            }
        }



        future::ok(())
    });


    //todo: figure out what this boilerplate actually does
    let receive_from_others = rx.map(Ok).forward(outgoing);
    pin_mut!(handle_incoming, receive_from_others);
    future::select(handle_incoming, receive_from_others).await;

    println!("{} disconnected", &addr);
    peer_map.lock().unwrap().remove(&addr);
}

async fn rest_root() -> &'static str {
    "hello there!"
}

async fn messages() -> String {
    println!("get messages");
    let messages: Vec<ChatMessage> = vec![ChatMessage::new(
        String::from("Some-id"),
        String::from("2025-05-08T19:15:15Z"),
        String::from("hello"),
        String::from(Uuid::new_v4()),
    )];
    serde_json::to_string(&messages).unwrap()
}


//entry point for tokio
#[tokio::main]
async fn main() {
    
    //arc allows multiple threads to "own" the object at the same time
    //mutex locks the data from other threads while it's being accessed
    let state = PeerMap::new(Mutex::new(HashMap::new()));

    let rest_addr = env::args()
        .nth(1)
        .unwrap_or_else(|| "127.0.0.1:9000".to_string());
    let rest_listener = TcpListener::bind(&rest_addr)
        .await
        .expect("Failed to bind REST");

    let rest_server = async {
        let rest_router: Router<()> = Router::new()
            .route("/", axum::routing::get(rest_root))
            .route("/messages", axum::routing::get(messages));
        println!("Listening for REST on: {}", rest_addr);
        axum::serve(rest_listener, rest_router).await.unwrap();
    };

    //pay attention to the ports here when doing docker stuff
    let ws_addr = env::args()
        .nth(1)
        .unwrap_or_else(|| "127.0.0.1:9001".to_string());
    let try_ws_socket = TcpListener::bind(&ws_addr).await;
    let ws_listener = try_ws_socket.expect("Failed to bind");
    println!("Listening for WS on: {}", ws_addr);

    //as long as listener.accept() returns ok, spawn new async task, which is defined by fn handle_websocket_connection
    let ws_server = async {
        while let Ok((stream, addr)) = ws_listener.accept().await {
            println!("New WebSocket connection: {}", addr);
            tokio::spawn(handle_websocket_connection(state.clone(), stream, addr));
        }
    };
    //join the endpoints
    join!(rest_server, ws_server);
}



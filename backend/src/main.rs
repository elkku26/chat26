mod shared_types;

use std::collections::HashMap;
use std::net::{TcpListener, TcpStream};
use std::sync::{Arc, Mutex};
use std::thread::spawn;
use tungstenite::{accept, Utf8Bytes, WebSocket};
use serde::{Deserialize};
use serde_json::from_slice;
use tungstenite::protocol::Message as WsMessage;
use crate::shared_types::Message;

fn main () {

    //in memory database just for now
    //arc allows multiple threads to "own" the object at the same time
    //mutex locks the data from other threads while it's being accessed
    //vec! is a macro that lets us compactly init a vector with daat
    let messages : Arc<Mutex<Vec<String>>> = Arc::new(Mutex::new(vec![
        String::from("Hello1"),
        String::from("Hello2"),
    ]));

    let members: Arc<Mutex<HashMap<String,Arc<Mutex<WebSocket<TcpStream>>>>>> = Arc::new(Mutex::new(HashMap::new()));

    let server = TcpListener::bind("127.0.0.1:9001").unwrap();
    for stream in server.incoming() {
        //give each thread copies of messages and room
        let messages_copy = Arc::clone(&messages);
        let members_copy = Arc::clone(&members);

        spawn (move || {
            let websocket = accept(stream.unwrap()).unwrap();

            //store the websocket in an arc<mutex>> so we can safely store it
            let ws_arc = Arc::new(Mutex::new(websocket));

            loop {
                let mut ws_lock = ws_arc.lock().unwrap();
                let msg = ws_lock.read().unwrap();


                if  msg.is_text() {
                    let serialized = msg.into_text().unwrap();
                    let deserialized : Message = from_slice(serialized.as_bytes()).unwrap();
                    println!("{}", serde_json::to_string(&deserialized).unwrap());

                    match deserialized {
                        Message::EnterChat { username, time } => {
                            println!("user {} with time {}", username, time);



                            //this is of type MutexGuard<Vec<String>> and it's basically a representation of the lock as a variable
                            //so when this variable goes out of the scope, so does the lock
                            //we could drop it explicitly I think, but it's not necessary here since it goes out of scope when we'd want to drop it anyway
                            let history_guard = messages_copy.lock().unwrap();

                            // &* dereferences the mutexguard, then references that, which somehow removes the mutexguard and gives back a regular reference for the current thread to use normally (I think?)
                            let history_bytes = Utf8Bytes::from(serde_json::to_string(&*history_guard).unwrap());
                            let history_message = WsMessage::Text(Utf8Bytes::from(history_bytes));


                            let mut ws_lock = ws_arc.lock().unwrap();
                            ws_lock.send(history_message).unwrap();

                            //add the user to room_members
                            let mut members_lock = members_copy.lock().unwrap();
                            members_lock.insert(username, Arc::clone(&ws_arc));


                        }
                        Message::SendMsg { username, content, time } => {
                            println!("user {} with content {} at time {}", username, content, time);
                        }
                    }
                }
            }
        });
    }
}
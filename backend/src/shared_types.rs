use typeshare::typeshare;
use serde::{Deserialize, Serialize};
//Messages
#[typeshare]
#[derive(Serialize, Deserialize, Debug)]
pub struct WSClientMessage {
    pub(crate) id: String,
    pub(crate) kind: WSClientMessageKind,
    pub(crate) payload: serde_json::Value,
}

#[typeshare]
#[derive(Serialize, Deserialize, Debug)]
pub struct WSServerMessage {
    pub(crate) id: String,
    pub(crate) kind: WSServerMessageKind,
    pub(crate) payload: serde_json::Value,
}

//Message kinds
#[typeshare]
#[derive(Serialize, Deserialize, Debug)]
pub enum WSClientMessageKind {
    JoinRoom,
    SendChat,
}

#[typeshare]
#[derive(Serialize, Deserialize, Debug)]
pub enum WSServerMessageKind {
    Ping,
}

//message payloads

#[typeshare]
#[derive(Serialize, Deserialize, Debug)]
pub struct JoinRoomPayload {
    pub user_id: String,
}

#[typeshare]
#[derive(Serialize, Deserialize, Debug)]
pub struct SendChatPayload {
    pub chat_message: ChatMessage,
}




//-------------------------------
//data structures for business logic
#[typeshare]
#[derive(Serialize, Deserialize)]
pub struct User {
    pub(crate) id: String,
    pub(crate) created_at: String,
    pub(crate) username: String,
    pub(crate) status: Status
}

#[typeshare]
#[derive(Serialize, Deserialize)]
pub enum Status {
    Online,
    Offline,
}

#[typeshare]
#[derive(Serialize, Deserialize, Debug)]
pub struct ChatMessage {
    pub(crate) id: String,
    pub(crate) time: String,
    pub(crate) content: String,
    pub(crate) sender_id: String,
}


//constructor for chatmessage
impl ChatMessage {
    pub fn new(id: String, time: String, content: String, sender_id: String) -> Self {
        Self {
            id,
            time,
            content,
            sender_id
        }
    }
}



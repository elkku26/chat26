use serde::{Deserialize, Serialize};
use typeshare::typeshare;

//Messages, distinguished by sender
#[typeshare]
#[derive(Serialize, Deserialize, Debug)]
pub struct WSClientMessage {
    pub(crate) msg_id: String,
    pub(crate) kind: WSClientMessageKind,
    pub(crate) payload: serde_json::Value,
}

#[typeshare]
#[derive(Serialize, Deserialize, Debug)]
pub struct WSServerMessage {
    pub(crate) msg_id: String,
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
    ForwardChat,
    UserJoined,
    Acknowledged,
    NotAcknowledged,
}

#[typeshare]
#[derive(Serialize, Deserialize, Debug)]
pub enum AcknowledgeKind {
    UserJoined,
    ForwardChat,
    SendChat,
    JoinRoom,
}

//message payloads
#[typeshare]
#[derive(Serialize, Deserialize, Debug)]
pub struct JoinRoomPayload {
    pub username: String,
}

#[typeshare]
#[derive(Serialize, Deserialize, Debug)]
pub struct SendChatPayload {
    pub sender_id: String,
    pub content: String,
}

#[typeshare]
#[derive(Serialize, Deserialize, Debug)]
pub struct ForwardChatPayload {
    pub chat_message: ChatMessage,
}

#[typeshare]
#[derive(Serialize, Deserialize, Debug)]
pub struct UserJoinedPayload {
    pub(crate) user: User,
}

#[typeshare]
#[derive(Serialize, Deserialize, Debug)]
pub struct AcknowledgePayload {
    pub(crate) related_msg_id: String,
    pub(crate) acknowledged: bool,
    pub(crate) data: serde_json::Value,
    pub(crate) kind: AcknowledgeKind,
}

/*
#[typeshare]
#[derive(Serialize, Deserialize, Debug)]
pub struct CreateUserResponsePayload {
    pub(crate) uuid: String,
}

#[typeshare]
#[derive(Serialize, Deserialize, Debug)]
pub struct SendChatResponsePayload {
    pub(crate) chat_message: ChatMessage,
}
*/

//-------------------------------
//data structures for business logic
#[typeshare]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct User {
    pub(crate) id: String,
    pub(crate) created_at: String,
    pub(crate) username: String,
    // pub(crate) status: Status,
}

//let's not worry about status for now
/*
#[typeshare]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum Status {
    Online,
    Offline,
}*/

#[typeshare]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ChatMessage {
    pub(crate) id: String,
    pub(crate) created_at: String,
    pub(crate) content: String,
    pub(crate) sender_id: String,
}

//constructor for chatmessage
impl ChatMessage {
    pub fn new(id: String, created_at: String, content: String, sender_id: String) -> Self {
        Self {
            id,
            created_at,
            content,
            sender_id,
        }
    }
}

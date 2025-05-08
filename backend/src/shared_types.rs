use ts_rs::TS;
#[derive(TS, Debug, serde::Serialize, serde::Deserialize)]
#[ts(export)]
pub struct WSMessage {
    pub(crate) id: String,
    pub(crate) kind: MessageKind,
}

#[derive(TS, Debug, serde::Serialize, serde::Deserialize)]
#[ts(export)]
pub enum MessageKind {
    EnterRoom { username: String, time: String },
    SendChat { sender: String, content: String, time: String },
    GetHistory {},
}
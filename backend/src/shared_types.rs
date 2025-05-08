use ts_rs::TS;
#[derive(TS, Debug, serde::Serialize, serde::Deserialize)]
#[ts(export)]
pub enum Message {
    EnterChat {username: String, time: String},
    SendMsg {username: String, content: String, time: String },
}

/// For types that we don't want to expose to the client
/// These are stored in a separate file for clarity

use crate::shared_types::{ChatMessage, User};

#[derive(Clone)]
pub struct AppState {
    pub messages: Vec<ChatMessage>,
    pub room_members: Vec<User>,
}

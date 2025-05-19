import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage, User } from "../types/shared-types";
import { RootState } from "../app/store";

export interface ChatState {
  messages: ChatMessage[];
  users: User[];
}

const initialState: ChatState = {
  messages: [],
  users: [],
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
  },
});

//reducer actions
export const { setMessages, setUsers } = chatSlice.actions;
//selectors
export const selectMessages = (state: RootState) => state.chat.messages;
export const selectUsers = (state: RootState) => state.chat.users;
export const selectUserWithId = (state: RootState, user_id: string) => {
  return state.chat.users.filter((user) => user.id == user_id)[0];
};

export default chatSlice.reducer;

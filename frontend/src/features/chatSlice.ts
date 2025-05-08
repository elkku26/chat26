import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Message } from '../types'
import { RootState } from '../app/store'

export interface ChatState {
  messages: Message[]
}

const initialState: ChatState = {
  messages: []
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChat: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload
    }
  }
})

//reducer actions
export const { setChat } = chatSlice.actions

//selectors
export const selectMessages = (state: RootState) => state.chat.messages


export default chatSlice.reducer
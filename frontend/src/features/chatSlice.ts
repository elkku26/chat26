import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { ChatMessage } from '../types/shared-types'
import { RootState } from '../app/store'

export interface ChatState {
  messages: ChatMessage[]
}

const initialState: ChatState = {
  messages:[]
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload
    }
  }
})

//reducer actions
export const { setMessages } = chatSlice.actions 
//selectors
export const selectMessages = (state: RootState) => state.chat.messages


export default chatSlice.reducer
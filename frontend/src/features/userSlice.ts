import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Status, User } from '../types/shared-types'
import { RootState } from '../app/store'

// Define the TS type for the counter slice's state
export interface UserState {
  currentUser: User
}

const initialState: UserState = {
  currentUser: {  
    username: "Anonymous User",
    status: Status.Offline,
    id: "",
    created_at: ""
  }

}

export const userSlice = createSlice({
  name: 'currentUser',
  initialState,
  reducers: {
    setUserName: (state, action: PayloadAction<string>) => {
      state.currentUser.username = action.payload
    },
    setStatus: (state, action: PayloadAction<Status>) => {
        state.currentUser.status = action.payload
    },
    setUserUuid : (state, action: PayloadAction<string>) => {
      state.currentUser.id = action.payload
    }
  }
})

//reducer actions
export const { setUserName, setStatus, setUserUuid } = userSlice.actions

//selectors
export const selectUserName = (state: RootState) => state.user.currentUser.username
export const selectStatus = (state: RootState) => state.user.currentUser.status
export const selectUserId = (state : RootState) => state.user.currentUser.id

export default userSlice.reducer
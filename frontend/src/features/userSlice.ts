import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Status } from '../types/shared-types'
import { RootState } from '../app/store'
import {v4 as uuidv4} from 'uuid'

// Define the TS type for the counter slice's state
export interface UserState {
  name: string
  status: Status
  id: string
}

const initialState: UserState = {
  name: "Anonymous User",
  status: Status.Offline,
  id: uuidv4()
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserName: (state, action: PayloadAction<string>) => {
      state.name = action.payload
    },
    setStatus: (state, action: PayloadAction<Status>) => {
        state.status = action.payload
    }
  }
})

//reducer actions
export const { setUserName, setStatus } = userSlice.actions

//selectors
export const selectUserName = (state: RootState) => state.user.name
export const selectStatus = (state: RootState) => state.user.status
export const selectUserId = (state : RootState) => state.user.id

export default userSlice.reducer
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Status } from '../types'
import { RootState } from '../app/store'

// Define the TS type for the counter slice's state
export interface UserState {
  name: string
  status: Status
}

const initialState: UserState = {
  name: "Anonymous User",
  status: Status.Offline
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

export default userSlice.reducer
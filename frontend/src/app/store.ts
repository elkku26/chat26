//React-Redux would likely be overkill for a project like this in practice, but I'm using it here for showcase purposes

import { configureStore } from '@reduxjs/toolkit'
import userSlice from '../features/userSlice'




//export store
export const store = configureStore({
  reducer: {
    user: userSlice
}})

//export types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store


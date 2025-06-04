import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types/shared-types";
import { RootState } from "../store";

// Define the TS type for the counter slice's state
export interface UserState {
  currentUser: User;
}

const initialState: UserState = {
  currentUser: {
    username: "Anonymous User",
    id: "",
    created_at: "",
  },
};

export const userSlice = createSlice({
  name: "currentUser",
  initialState,
  reducers: {
    setUserName: (state, action: PayloadAction<string>) => {
      state.currentUser.username = action.payload;
    },
    setUserUuid: (state, action: PayloadAction<string>) => {
      state.currentUser.id = action.payload;
    },

    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser.username = action.payload.username;
      state.currentUser.id = action.payload.id;
      state.currentUser.created_at = action.payload.created_at;
    },
  },
});

//reducer actions
export const { setUserName, setUserUuid, setCurrentUser } = userSlice.actions;

//selectors
export const selectUserName = (state: RootState) =>
  state.user.currentUser.username;
export const selectUserId = (state: RootState) => state.user.currentUser.id;
export const selectCurrentUser = (state: RootState) => state.user;

export default userSlice.reducer;

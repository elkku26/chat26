import { User, WSClientMessage } from "@/types/shared-types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface SocketState {
  socket: WebSocket | null;
}

const initialState: SocketState = {
  socket: null,
};

export const socketSlice = createSlice({
  name: "websocket",
  initialState,
  reducers: {
    connect: (state) => {},
    disconnect: (state, action: PayloadAction<string>) => {},

    send: (state, action: PayloadAction<WSClientMessage>) => {},
  },
});

export default socketSlice.reducer;
export const { connect, disconnect, send } = socketSlice.actions;

import { User, WSClientMessage } from "@/types/shared-types";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface SocketState {
  socket: WebSocket | null;
  isConnected: boolean;
}

const initialState: SocketState = {
  socket: null,
  isConnected: false,
};

export const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    connect: (state) => {},
    disconnect: (state) => {},
    setIsConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    send: (state, action: PayloadAction<WSClientMessage>) => {},
  },
});

export const selectIsConnected = (state: RootState) => state.socket.isConnected;

export default socketSlice.reducer;
export const { connect, disconnect, send, setIsConnected } =
  socketSlice.actions;

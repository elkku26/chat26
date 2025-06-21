//React-Redux would likely be overkill for a project like this in practice, but I'm using it here for showcase purposes

import { configureStore } from "@reduxjs/toolkit";
import userSlice from "@/lib/features/userSlice";
import chatSlice from "@/lib/features/chatSlice";
import socketMiddleware from "@/app/middleware/websocket";
import socketSlice from "./features/socketSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userSlice,
      chat: chatSlice,
      socket: socketSlice,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(socketMiddleware),
  });
};

//export types
export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
export type RootState = ReturnType<AppStore["getState"]>;

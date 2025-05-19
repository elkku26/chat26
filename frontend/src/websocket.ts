import {
  WSClientMessage,
  WSServerMessageKind,
  AcknowledgePayload,
} from "./types/shared-types";
import { v4 as uuidv4 } from "uuid";
import { store } from "./app/store";
import { setMessages, setUsers } from "./features/chatSlice";

const socket = new WebSocket(
  process.env.REACT_APP_WS_ENDPOINT + ":" + process.env.REACT_APP_WS_PORT || ""
);

function sendMsg(msg: WSClientMessage): Promise<AcknowledgePayload> {
  console.log(
    "sendMsg: sending",
    JSON.stringify(msg),
    "to",
    process.env.REACT_APP_WS_ENDPOINT + ":" + process.env.REACT_APP_WS_PORT
  );
  const id = uuidv4();
  msg.msg_id = id;
  socket.send(JSON.stringify(msg));
  return new Promise((res, rej) => {
    socket.addEventListener("message", (e) => {
      setTimeout(() => {
        rej("sendMsg timed out");
      }, 5000);
      const wsResponse = JSON.parse(e.data);
      if (wsResponse.payload.related_msg_id === msg.msg_id)
        if (wsResponse.kind == WSServerMessageKind.Acknowledged) {
          console.log("resolved message", wsResponse);
          res(wsResponse.payload);
        } else {
          rej("Server error: response wasn't of type Acknowledged");
        }
    });
  });
}

socket.onmessage = function (e) {
  console.log("received message through websocket", e);
  const wsMessage = JSON.parse(e.data);
  switch (wsMessage.kind) {
    case WSServerMessageKind.Ping: {
      console.log("branch ping");
      break;
    }
    case WSServerMessageKind.ForwardChat: {
      console.log("branch forwardchat");
      const chatMessages = store.getState().chat.messages;
      store.dispatch(
        setMessages([...chatMessages, wsMessage.payload.chat_message])
      );
      break;
    }
    case WSServerMessageKind.UserJoined: {
      console.log("branch userjoined");
      const users = store.getState().chat.users;
      store.dispatch(setUsers([...users, wsMessage.payload.user]));
      break;
    }
  }
};

export { sendMsg };

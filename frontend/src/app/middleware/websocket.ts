import { setMessages, setUsers } from "@/lib/features/chatSlice";
import { setCurrentUser } from "@/lib/features/userSlice";
import { RootState } from "@/lib/store";
import {
  AcknowledgeKind,
  ChatMessage,
  User,
  WSClientMessage,
  WSServerMessage,
  WSServerMessageKind,
} from "@/types/shared-types";

export const WS_CONNECT = "websocket/connect";
export const WS_SEND = "websocket/send";
export const WS_DISCONNECT = "websocket/disconnect";

const socketMiddleware = (store) => {
  let socket: WebSocket | null = null;

  return (next) => (action) => {
    switch (action.type) {
      case WS_CONNECT:
        console.log("Connecting with middleware");
        console.log(action);
        console.log(
          process.env.NEXT_PUBLIC_WS_ENDPOINT +
            ":" +
            process.env.NEXT_PUBLIC_WS_PORT
        );

        socket = new WebSocket(
          process.env.NEXT_PUBLIC_WS_ENDPOINT +
            ":" +
            process.env.NEXT_PUBLIC_WS_PORT
        );

        socket.onopen = function (e) {
          console.log("socket is open");
        };

        socket.onmessage = (e) => {
          console.log("received message through websocket", e);
          const wsMessage: WSServerMessage = JSON.parse(e.data);
          let msg_id: string = wsMessage.payload.related_msg_id;
          switch (wsMessage.kind) {
            case WSServerMessageKind.Ping: {
              console.log("branch ping");
              break;
            }
            case WSServerMessageKind.ForwardChat: {
              console.log("branch forwardchat");
              const chatMessages: ChatMessage[] =
                store.getState().chat.messages;

              //disregard incorrect forwards to avoid duplication
              if (
                chatMessages.filter((msg) => {
                  msg.id === wsMessage.payload.chat_message.id;
                }).length !== 0
              ) {
                console.log("duplicate skipped");
                break;
              }
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
            case WSServerMessageKind.Acknowledged: {
              console.log("messsage", msg_id, "acknowledged by server");

              break;
            }
            case WSServerMessageKind.NotAcknowledged: {
              console.log("messsage", msg_id, "not acknowledged by server");
              break;
            }
          }
        };
        break;

      case WS_SEND:
        console.log("WS_SEND with action:", action.payload);
        if (socket?.readyState === WebSocket.OPEN)
          socket.send(JSON.stringify(action.payload));
        else {
          console.log("socket is not open :(");
        }

        const msg: WSClientMessage = action.payload;

        return new Promise((res, rej) => {
          socket?.addEventListener("message", (e) => {
            setTimeout(() => {
              rej("sendMsg timed out");
            }, 5000);
            const wsResponse = JSON.parse(e.data);
            const responsePayload = wsResponse.payload;
            if (responsePayload.related_msg_id === msg.msg_id)
              if (wsResponse.kind === WSServerMessageKind.Acknowledged) {
                console.log("resolved message", wsResponse);
                const currentState: RootState = store.getState();

                switch (responsePayload.kind) {
                  case AcknowledgeKind.ForwardChat:
                    console.log("forwardchat acknowledgement fnot implemented");

                    break;
                  case AcknowledgeKind.JoinRoom:
                    const user: User = wsResponse.payload.data;

                    store.dispatch(
                      setUsers([...currentState.chat.users, user])
                    );
                    store.dispatch(setCurrentUser(user));

                    localStorage.setItem("user-id", user.id);
                    console.log("set user-id to", user.id);

                    console.log("new user:", user);

                    break;
                  case AcknowledgeKind.SendChat:
                    store.dispatch(
                      setMessages([
                        ...currentState.chat.messages,
                        wsResponse.payload.data as ChatMessage,
                      ])
                    );
                    console.log("new chatmessage:", wsResponse.payload.data);

                    break;
                  case WSServerMessageKind.UserJoined:
                    store.dispatch(
                      setUsers([
                        ...currentState.chat.users,
                        wsResponse.payload.data as User,
                      ])
                    );
                    store.dispatch(
                      setCurrentUser(wsResponse.payload.data as User)
                    );

                    console.log("new user:", wsResponse.payload.data);
                    break;
                  default:
                    console.log("unrecognized response kind");
                }

                res(wsResponse.payload);
              } else {
                rej(
                  "Server error: response from server with matching id wasn't of type Acknowledged"
                );
              }
          });
        });

        break;

      case WS_DISCONNECT:
        console.log(
          "The WS_DISCONNECT action has been dispatched, closing socket"
        );
        if (socket) socket.close();
        socket = null;
        break;

      default:
        return next(action);
    }
  };
};

export default socketMiddleware;

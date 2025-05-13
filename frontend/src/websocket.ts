import { WSClientMessage, WSServerMessage, WSServerMessageKind, ForwardChatPayload } from "./types/shared-types";
import {v4 as uuidv4} from 'uuid'
import { store } from './app/store'
import { setMessages } from "./features/chatSlice";


const socket = new WebSocket(process.env.REACT_APP_WS_ENDPOINT+ ':'+ process.env.REACT_APP_WS_PORT|| "");



function sendMsg(msg : WSClientMessage) {
    console.log("sending", JSON.stringify(msg),"to", process.env.REACT_APP_WS_ENDPOINT+ ':'+ process.env.REACT_APP_WS_PORT)
    const id = uuidv4();
    msg.id = id
    socket.send(JSON.stringify(msg))
    }

function readMsg (msg : WSServerMessage) {
    console.log("received msg", msg)
}

socket.onmessage = function (e) {
    console.log("received message", e);
    const wsMessage = JSON.parse(e.data);
    switch (wsMessage.kind) {
        case WSServerMessageKind.Ping: {
            console.log("ping");
            break;
        }
        case WSServerMessageKind.ForwardChat: {
            console.log("forwardchat");
            const chatMessages = store.getState().chat.messages
            store.dispatch(setMessages([...chatMessages, wsMessage.payload.chat_message]))
            break;
        }
    }

    }

export {sendMsg};
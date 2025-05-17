import { WSClientMessage, WSServerMessage, WSServerMessageKind, ForwardChatPayload, WSClientMessageKind } from "./types/shared-types";
import {v4 as uuidv4} from 'uuid'
import { store } from './app/store'
import { setMessages, setUsers } from "./features/chatSlice";


const socket = new WebSocket(process.env.REACT_APP_WS_ENDPOINT+ ':'+ process.env.REACT_APP_WS_PORT|| "");



function sendMsg(msg : WSClientMessage) {
    console.log("sending", JSON.stringify(msg),"to", process.env.REACT_APP_WS_ENDPOINT+ ':'+ process.env.REACT_APP_WS_PORT)
    const id = uuidv4();
    msg.id = id
    socket.send(JSON.stringify(msg))
    switch(msg.kind) {
        case WSClientMessageKind.SendChat: {
            console.log("not implemented!")
            break;
        }
        default: {

        }
    }
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
        case WSServerMessageKind.UserJoined: {
            console.log("userjoined");
            const users = store.getState().chat.users
            store.dispatch(setUsers([...users, wsMessage.payload.user]))
            break;
        }
        case WSServerMessageKind.SendChatResponse: {
            console.log("sendchatresponse")
        }
    }
}


export {sendMsg};
import { WSClientMessage, WSServerMessage } from "./types/shared-types";
import {v4 as uuidv4} from 'uuid'

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
}

export {readMsg, sendMsg};
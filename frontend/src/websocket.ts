import { WSClientMessage, WSServerMessage } from "./types/shared-types";
import {v4 as uuidv4} from 'uuid'
const WSS_ENDPOINT = "ws://127.0.0.1:9001/ws"

const socket = new WebSocket(WSS_ENDPOINT);




function sendMsg(msg : WSClientMessage) {
    console.log("sending", JSON.stringify(msg),"to", WSS_ENDPOINT)
    const id = uuidv4();
    msg.id = id
    socket.send(JSON.stringify(msg))
    }

function readMsg (msg : WSServerMessage) {

}

export {readMsg, sendMsg};
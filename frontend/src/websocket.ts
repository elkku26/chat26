import { WSMessage } from "../src/types";
import {v4 as uuidv4} from 'uuid'
const WSS_ENDPOINT = "ws://127.0.0.1:9001"

const socket = new WebSocket(WSS_ENDPOINT);


const pendingRequests = new Map<string, (response: WSMessage) => void>();

socket.onmessage = (e: MessageEvent) => {
    console.log("Received response", e.data);
    const msg : WSMessage = JSON.parse(e.data)

    console.log(JSON.stringify(Array.from(pendingRequests.entries())))
    console.log("message",JSON.stringify(msg))
    console.log(msg['id'])

    if (msg.id && pendingRequests.has(msg.id)) {
        pendingRequests.get(msg.id)!(msg);
        pendingRequests.delete(msg.id);
    } else 
        console.log("Unsolicited event:", msg)
}

socket.onopen = (e: Event) => { 
    console.log("Hello world!")
}



function sendMsg(msg : WSMessage) : Promise<WSMessage> {
    console.log("sending", JSON.stringify(msg),"to", WSS_ENDPOINT)
    const id = uuidv4();
    msg.id = id
    return new Promise( (resolve, reject) => {
        pendingRequests.set(id, resolve)
        console.log("add request with id", id, "to pending requests")
        try {
            console.log("here we are", JSON.stringify(msg))
            socket.send(JSON.stringify(msg))
            
        } catch {
            pendingRequests.delete(id);
            reject("Failed to send msg")
        }    
    })
    }



export {sendMsg};
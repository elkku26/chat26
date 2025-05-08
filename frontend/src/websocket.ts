import { Message } from "../../backend/bindings/Message";

const WSS_ENDPOINT = "ws://127.0.0.1:9001"

const socket = new WebSocket(WSS_ENDPOINT);


socket.onmessage = (e: MessageEvent) => {
    console.log("You've got mail!", e.data);
}

socket.onopen = (e: Event) => { 
    console.log("Hello world!")
}



function sendMsg(msg : Message) {
    console.log(WSS_ENDPOINT)
    socket.send(JSON.stringify(msg))
}


export {sendMsg};
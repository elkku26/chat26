import { Message } from "../../backend/bindings/Message";

const WSS_ENDPOINT = /* process.env.WSS_ENDPOINT + ":" + process.env.WSS_PORT || */ "ws://127.0.0.1:9001"

const socket = new WebSocket(WSS_ENDPOINT);

socket.addEventListener("open", (event) => {
    socket.send("Hello Server!");
  });

socket.addEventListener("message", (e) => {
    console.log("received message:", JSON.stringify(e))
}) 

function sendMsg(msg : Message) {
    console.log(WSS_ENDPOINT)
    socket.send(JSON.stringify(msg))
}


export {sendMsg};
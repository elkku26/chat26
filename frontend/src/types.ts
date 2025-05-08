import { WSMessage as _WSMessage } from "../../backend/bindings/WSMessage";


export enum Status {
    Offline = "offline",
    Online = "online"
}

export type Message = {
    content: string,
    sender: string,
    time: string
}



export type WSMessage = _WSMessage;
export namespace WSMessage {
  type _enterRoom = Extract<_WSMessage, {EnterRoom: unknown} >;
  type _sendMsg = Extract<_WSMessage, {SendMsg: unknown} >;
  export type EnterRoom = _enterRoom["EnterRoom"];
  export type SendMsg  = _sendMsg["SendMsg"];
}

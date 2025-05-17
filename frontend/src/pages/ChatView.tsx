import { selectMessages, setMessages } from '../features/chatSlice';
import { selectStatus, selectUserId, selectUserName } from '../features/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { ChatMessage, SendChatPayload, WSClientMessage, WSClientMessageKind } from '../types/shared-types';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { sendMsg } from '../websocket';


function ChatView() {

  const userName = useSelector(selectUserName)
  const status = useSelector(selectStatus)
  const id = useSelector(selectUserId)

  const [currentMessageContent, setCurrentMessageContent] = useState<string>("")

  const messages: ChatMessage[] = useSelector(selectMessages)

  const dispatch = useDispatch()

  useEffect(() => {

    //note to self: on StrictMode (which is on by default in the dev env) causes this component to render twice
    //which also means the data is loaded twice, which looks a lot like a bug (especially looking at it from the server's point of view!)
    //but I've confirmed this behaviour goes away when strictmode is turned off
    async function fetchData() {
      const response = await fetch(
        `${process.env.REACT_APP_REST_ENDPOINT}:${process.env.REACT_APP_REST_PORT}/messages`
        )

      const parsedResponse: ChatMessage[] = await response.json()

      console.log("parsedresponse is", parsedResponse)

      dispatch(setMessages(parsedResponse))
    }
    fetchData();
  }, [dispatch]) //dispatch will never actually change but useEffect doesn't know what

  async function sendMessage(e: FormEvent<HTMLButtonElement>) {
    console.log("yeehaw")
    const payload : SendChatPayload = {sender_id: id, content: currentMessageContent}
    const message : WSClientMessage = {id: uuidv4(), payload: payload, kind: WSClientMessageKind.SendChat}
    sendMsg(message);
    dispatch(setMessages([...messages, {id:"",created_at:"",content:"",sender_id:""}])) //TODO: get the time from the server
  }

  function setMessageText(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.textContent !== null) {
      setCurrentMessageContent(e.target.value)
    }
  }

  return (
    <div className="ChatView">
      <h1>{userName}</h1>
      <ol>
        {messages.map((message) => {
          return (
            <li style={{ "listStyleType": "none" }} key={message.id}>
              {message.sender_id} said: {message.content} @ {message.created_at}
            </li>
          )
        })}
      </ol>
      <div>
        <input onChange={(e)=> setMessageText(e)}type="textbox" />
        <button onClick={(e) => sendMessage(e)}>Send message</button>
      </div>
    </div>
  );
}

export default ChatView;

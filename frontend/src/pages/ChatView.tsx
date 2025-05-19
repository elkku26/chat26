import {
  selectMessages,
  selectUsers,
  setMessages,
} from "../features/chatSlice";
import { selectUserId, selectUserName } from "../features/userSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  ChatMessage,
  SendChatPayload,
  WSClientMessage,
  WSClientMessageKind,
} from "../types/shared-types";
import { ChangeEvent, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { sendMsg } from "../websocket";

function ChatView() {
  const userName = useSelector(selectUserName);
  const userId = useSelector(selectUserId);

  const users = useSelector(selectUsers);

  const [currentMessageContent, setCurrentMessageContent] =
    useState<string>("");

  const messages: ChatMessage[] = useSelector(selectMessages);

  const dispatch = useDispatch();

  useEffect(() => {
    //note to self: on StrictMode (which is on by default in the dev env) causes this component to render twice
    //which also means the data is loaded twice, which looks a lot like a bug (especially looking at it from the server's point of view!)
    //but I've confirmed this behaviour goes away when strictmode is turned off
    async function fetchData() {
      const response = await fetch(
        `${process.env.REACT_APP_REST_ENDPOINT}:${process.env.REACT_APP_REST_PORT}/messages`
      );
      const parsedMessages: ChatMessage[] = await response.json();
      dispatch(setMessages(parsedMessages));
    }
    fetchData();
  }, [dispatch]); //dispatch will never actually change but useEffect doesn't know what

  async function sendMessage() {
    if (currentMessageContent != "") {
      const payload: SendChatPayload = {
        sender_id: userId,
        content: currentMessageContent,
      };
      const message: WSClientMessage = {
        msg_id: uuidv4(),
        payload: payload,
        kind: WSClientMessageKind.SendChat,
      };
      let response = await sendMsg(message);
      let newMessage = response.data as ChatMessage;
      dispatch(setMessages([...messages, newMessage]));
    }
  }

  function setMessageText(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.textContent !== null) {
      setCurrentMessageContent(e.target.value);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      sendMessage();
      setCurrentMessageContent("");
    }
  }

  return (
    <div className="ChatView">
      <h1>{userName}</h1>
      <ol>
        {messages.map((message) => {
          return (
            <li style={{ listStyleType: "none" }} key={message.id}>
              {users.filter((user) => user.id == message.sender_id)[0].username}{" "}
              said: {message.content} @ {message.created_at}
            </li>
          );
        })}
      </ol>
      <div>
        <input
          value={currentMessageContent}
          onKeyDown={(e) => handleKeyDown(e)}
          onChange={(e) => setMessageText(e)}
          type="textbox"
        />
        <button onClick={() => sendMessage()}>Send message</button>
      </div>
    </div>
  );
}

export default ChatView;

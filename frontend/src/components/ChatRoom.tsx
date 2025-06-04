"use client";
import { selectUserId, selectUserName } from "@/lib/features/userSlice";

import {
  setMessages,
  selectMessages,
  selectUsers,
  setUsers,
} from "@/lib/features/chatSlice";
import {
  ChatMessage,
  SendChatPayload,
  User,
  WSClientMessage,
  WSClientMessageKind,
} from "@/types/shared-types";
import { ChangeEvent, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button, Container, List, Paper, Text, TextInput } from "@mantine/core";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { send } from "@/lib/features/socketSlice";

type ChatRoomProps = {};

function ChatRoom(props: ChatRoomProps) {
  const userName = useAppSelector(selectUserName);
  const currentUserId = useAppSelector(selectUserId);
  const messages = useAppSelector(selectMessages);

  const users = useAppSelector(selectUsers);

  const [currentMessageContent, setCurrentMessageContent] =
    useState<string>("");

  const dispatch = useAppDispatch();

  useEffect(() => {
    //note to self: on StrictMode (which is on by default in the dev env) causes this component to render twice
    //which also means the data is loaded twice, which looks a lot like a bug (especially looking at it from the server's point of view!)
    //but I've confirmed this behaviour goes away when strictmode is turned off
    async function fetchData() {
      const messageResponse = await fetch(
        `${process.env.NEXT_PUBLIC_REST_ENDPOINT}:${process.env.NEXT_PUBLIC_REST_PORT}/messages`
      );
      const usersResponse = await fetch(
        `${process.env.NEXT_PUBLIC_REST_ENDPOINT}:${process.env.NEXT_PUBLIC_REST_PORT}/users`
      );
      const parsedUsers: User[] = await usersResponse.json();
      const parsedMessages: ChatMessage[] = await messageResponse.json();

      console.log("fetched messages", parsedMessages);
      console.log("fetched users", parsedUsers);
      dispatch(setMessages(parsedMessages));
      dispatch(setUsers(parsedUsers));
    }
    fetchData();
  }, [dispatch]); //dispatch will never actually change but useEffect doesn't know what

  async function sendMessage() {
    if (currentMessageContent !== "") {
      const payload: SendChatPayload = {
        sender_id: currentUserId,
        content: currentMessageContent,
      };
      const message: WSClientMessage = {
        msg_id: uuidv4(),
        payload: payload,
        kind: WSClientMessageKind.SendChat,
      };

      dispatch(send(message));

      /*let response = await sendMsg(message); //This can't be executed in a client component
      let newMessage = response.data as ChatMessage;
      dispatch(setMessages([...messages, newMessage]));*/

      //^^^instead of that, let's just dispatch an action that does the same thing^^^
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
    <Container fluid>
      <h1>Chat</h1>
      <Container>
        <List>
          {messages.map((message) => {
            return (
              <List.Item style={{ listStyleType: "none" }} key={message.id}>
                <Container>
                  <Paper style={{ background: "teal.2" }} shadow="xs" p="xl">
                    <Text style={{}}>
                      {message.sender_id === currentUserId
                        ? "You"
                        : users.filter(
                            (user) => user.id === message.sender_id
                          )[0].username}{" "}
                      said: {message.content} @ {message.created_at}
                    </Text>
                  </Paper>
                </Container>
              </List.Item>
            );
          })}
        </List>
      </Container>
      <Container>
        <TextInput
          value={currentMessageContent}
          onKeyDown={(e) => handleKeyDown(e)}
          onChange={(e) => setMessageText(e)}
        />
        <Button onClick={() => sendMessage()}>Send message</Button>
      </Container>
    </Container>
  );
}

export default ChatRoom;

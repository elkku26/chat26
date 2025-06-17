"use client";
import { selectUserId, selectUserName } from "@/lib/features/userSlice";

import mysteryman from "@/mysteryman.png";

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
import { ChangeEvent, Suspense, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Button,
  Container,
  Flex,
  Group,
  List,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { disconnect, send } from "@/lib/features/socketSlice";
import { useFormatter, useNow } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";

type ChatRoomProps = {};

function ChatRoom(props: ChatRoomProps) {
  const currentUserId = useAppSelector(selectUserId);
  const messages = useAppSelector(selectMessages);
  const router = useRouter();

  const users = useAppSelector(selectUsers);

  const currentUser = users.filter((user) => user.id === currentUserId)[0];

  const [currentMessageContent, setCurrentMessageContent] =
    useState<string>("");

  const dispatch = useAppDispatch();
  const format = useFormatter();
  const now = useNow();

  async function fetchData() {
    //note to self: on StrictMode (which is on by default in the dev env) causes this component to render twice
    //which also means the data is loaded twice, which looks a lot like a bug (especially looking at it from the server's point of view!)
    //but I've confirmed this behaviour goes away when strictmode is turned off

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
  useEffect(() => {
    if (currentUserId === "") {
      router.push("/");
      dispatch(disconnect());
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
      setCurrentMessageContent("");

      dispatch(send(message));
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
  const theme = useMantineTheme();

  return (
    <Stack
      align="stretch"
      justify="center"
      gap="md"
      styles={{
        root: {
          margin: "2em",
          padding: "1em",
          backgroundColor: theme.colors.gray[0],
        },
      }}
    >
      <h1>Chat</h1>
      <ScrollArea h={600}>
        <List
          bg="gray.1"
          styles={{
            root: {
              margin: "0.5em",
              borderRadius: "0.25em",
              padding: "0.25em",
              height: "100%",
              backgroundColor: theme.colors.greenish[0],
            },
          }}
        >
          {messages.map((message) => {
            return (
              <List.Item style={{ listStyleType: "none" }} key={message.id}>
                <Group style={{ height: "100%", padding: "1em" }}>
                  <Container
                    style={{
                      backgroundColor:
                        message.sender_id === currentUserId
                          ? theme.colors.orange[1]
                          : theme.colors.greenish[2],
                    }}
                  >
                    <Text>
                      {message.sender_id === currentUserId
                        ? "You"
                        : users.filter(
                            (user) => user.id === message.sender_id
                          )[0].username}
                      :
                    </Text>
                    <Image
                      width={50}
                      height={50}
                      src={
                        users.filter((user) => user.id === message.sender_id)[0]
                          .pfp_url !== ""
                          ? users.filter(
                              (user) => user.id === message.sender_id
                            )[0].pfp_url
                          : mysteryman
                      }
                      alt={
                        "Profile picture of " +
                        users.filter((user) => user.id === message.sender_id)[0]
                          .username
                      }
                    ></Image>
                  </Container>
                  <Container
                    style={{ backgroundColor: theme.colors.greenish[1] }}
                  >
                    <Text>{message.content}</Text>
                  </Container>
                  <Container>
                    <Text>
                      {" "}
                      {format.relativeTime(
                        new Date(message.created_at),
                        new Date()
                      )}
                    </Text>
                  </Container>
                </Group>
              </List.Item>
            );
          })}
        </List>
      </ScrollArea>
      <Group>
        <TextInput
          value={currentMessageContent}
          onKeyDown={(e) => handleKeyDown(e)}
          onChange={(e) => setMessageText(e)}
        />
        <Button onClick={() => sendMessage()}>Send message</Button>
      </Group>
    </Stack>
  );
}

export default ChatRoom;

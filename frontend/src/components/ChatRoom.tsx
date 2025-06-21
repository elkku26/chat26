"use client";

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
import { connect, disconnect, send } from "@/lib/features/socketSlice";
import { useFormatter, useNow } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLocalStorage } from "@mantine/hooks";

type ChatRoomProps = {};

function ChatRoom(props: ChatRoomProps) {
  const messages = useAppSelector(selectMessages);
  const router = useRouter();

  const users = useAppSelector(selectUsers);

  const [userId, setUserId] = useLocalStorage({
    key: "user-id",
    defaultValue: "",
  });

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
    dispatch(disconnect());
    dispatch(connect());
    fetchData();
  }, [dispatch]); //dispatch will never actually change but useEffect doesn't know what

  async function sendMessage() {
    if (currentMessageContent !== "") {
      const payload: SendChatPayload = {
        sender_id: userId,
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
          backgroundColor: theme.colors.greenish[1],
          borderRadius: "0.25em",
        },
      }}
    >
      <Group justify="space-between">
        <h1>Chat</h1>
        <Button
          bg="red.4"
          onClick={() => {
            setUserId("");
            router.push("/");
          }}
        >
          <Text c="black.9">Logout</Text>
        </Button>
      </Group>
      <ScrollArea h={600}>
        <List
          styles={{
            root: {
              margin: "0.5em",
              borderRadius: "0.25em",
              borderColor: theme.colors.greenish[2],
              padding: "0.25em",
              height: "100%",
              backgroundColor: theme.colors.greenish[1],
            },
          }}
        >
          {messages.map((message) => {
            console.log("filtering users");
            console.log("users", users);

            const user = users.filter(
              (user) => user.id === message.sender_id
            )[0];
            return (
              <List.Item
                style={{
                  listStyleType: "none",
                  backgroundColor: "#FFFFFF",
                  margin: "0.5em",
                  borderRadius: "0.25em",
                }}
                key={message.id}
              >
                <Group
                  style={{
                    height: "100%",
                    padding: "1em",
                  }}
                >
                  <Image
                    width={50}
                    height={50}
                    src={
                      user.pfp_url !== ""
                        ? users.filter(
                            (user) => user.id === message.sender_id
                          )[0].pfp_url
                        : mysteryman
                    }
                    alt={"Profile picture of " + user.username}
                  ></Image>
                  <Text>
                    {message.sender_id === userId ? "You" : user.username}:
                  </Text>
                  <Container style={{}}>
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
        <Button bg="greenish.2" onClick={() => sendMessage()}>
          <Text c="black.9">Send message</Text>
        </Button>
      </Group>
    </Stack>
  );
}

export default ChatRoom;

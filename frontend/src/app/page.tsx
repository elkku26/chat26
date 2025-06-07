"use client";

import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { setUserName } from "@/lib/features/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  JoinRoomPayload,
  WSClientMessage,
  WSClientMessageKind,
} from "../types/shared-types";
import { selectUsers } from "@/lib/features/chatSlice";
import { connect, send } from "@/lib/features/socketSlice";
import { Button, Container, Input, TextInput } from "@mantine/core";
function Welcome() {
  const [username, setUsername] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(connect()); //open Websocket connection
    //todo: possible race condition here?
  }, []);
  const users = useSelector(selectUsers);
  const router = useRouter();

  function goToChat() {
    dispatch(setUserName(username));

    console.log("now we will go to chat!");

    //create and send new User to server

    const payload: JoinRoomPayload = { username: username };
    const message: WSClientMessage = {
      payload: payload,
      kind: WSClientMessageKind.JoinRoom,
      msg_id: uuidv4(),
    };
    dispatch(send(message));
    router.push("/chat");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      goToChat();
    }
  }

  return (
    <Container
      bg="orange.1"
      styles={{
        root: { borderRadius: "0.25em" },
      }}
    >
      <h1>Welcome to my cool chat app!</h1>
      <Container>
        <h2>Please input your name</h2>
        <TextInput
          styles={{
            root: { padding: "0.25em" },
          }}
          onKeyDown={(e) => {
            handleKeyDown(e);
          }}
          onChange={(e) => {
            setUsername(e.target.value);
          }}
          type="text"
        ></TextInput>
      </Container>
      <Button
        onClick={() => {
          goToChat();
        }}
        styles={{ root: { padding: "0.25em", margin: "0.5em" } }}
      >
        Go to chat room
      </Button>
    </Container>
  );
}

export default Welcome;

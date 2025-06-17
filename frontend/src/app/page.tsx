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
import { connect, disconnect, send } from "@/lib/features/socketSlice";
import {
  Button,
  Container,
  FileInput,
  Group,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
function Welcome() {
  const [username, setUsername] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(disconnect()); //do this to avoid multiple simultaneous connections
    dispatch(connect()); //open Websocket connection
    //todo: possible race condition here?
  }, []);

  const [pfp, setPfp] = useState<File | null>(null);
  const router = useRouter();

  const theme = useMantineTheme();

  async function goToChat() {
    dispatch(setUserName(username));

    //create and send new User to server

    let pfp_url = "";
    if (pfp !== null) {
      //Post pfp to minio endpoint
      console.log("Posting pfp to minio");

      let formData = new FormData();
      formData.append("image", pfp);

      const pfp_response = await fetch(
        `${process.env.NEXT_PUBLIC_REST_ENDPOINT}:${process.env.NEXT_PUBLIC_REST_PORT}/images`,
        {
          method: "POST",
          body: formData,
        }
      );
      pfp_url = await pfp_response.text();
      console.log("Server responded with pfp_url", pfp_url);
    } else {
      pfp_url = "";
    }

    const payload: JoinRoomPayload = { username, pfp_url };
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
      bg="greenish.1"
      styles={{
        root: { borderRadius: "0.25em", marginTop: "2em", padding: "1em" },
      }}
    >
      <h1>Welcome to my cool chat app!</h1>
      <Container>
        <h2 style={{ marginBottom: "0.1em" }}>Please input your name</h2>
        <TextInput
          label="Username"
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
        <Group
          style={{
            borderColor: "red",
            borderWidth: "0.2em",
            marginTop: "0.5em",
            marginBottom: "1em",
          }}
        >
          <h3>And optionally add a profile picture</h3>
          <Container style={{ border: theme.colors.gray[0] }}>
            <FileInput
              onChange={(picture) => setPfp(picture)}
              clearable
              accept="image/png,image/jpeg"
              variant="filled"
              label="Profile picture"
              placeholder="Add an image here!"
            ></FileInput>
          </Container>
        </Group>
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

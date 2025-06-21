"use client";

import classes from "./page.module.css";
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
import {
  connect,
  disconnect,
  selectIsConnected,
  send,
} from "@/lib/features/socketSlice";
import {
  Button,
  Container,
  FileInput,
  Group,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useAppSelector } from "@/lib/hooks";
function Welcome() {
  const [username, setUsername] = useState("");
  const dispatch = useDispatch();

  const isConnected = useAppSelector(selectIsConnected);
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

    if (isConnected) {
      console.log("Dispatching JoinRoom");
      dispatch(send(message));
      router.push("/chat");
    } else {
      console.warn("Not connected");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && username.length > 0) {
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
      <h1 className={classes.h1}>Welcome to my cool chat app!</h1>
      <Group>
        <h3>Please enter your name</h3>
        <TextInput
          label=""
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
          {/*           <h3 className={classes.h3}>And optionally add a profile picture</h3>
           */}{" "}
          <Container style={{ border: theme.colors.greenish[2] }}>
            <FileInput
              onChange={(picture) => setPfp(picture)}
              clearable
              accept="image/png,image/jpeg"
              variant="filled"
              label="Add a profile picture (optional)"
              placeholder="No image selected"
            ></FileInput>
          </Container>
        </Group>
      </Group>
      <Button
        onClick={() => {
          username.length > 0 ? goToChat() : {};
        }}
        disabled={username.length == 0}
        bg="greenish.2"
        styles={{ root: { padding: "0.5em", margin: "0.5em" } }}
      >
        <Text c="black.9">Go to chat room</Text>
      </Button>
    </Container>
  );
}

export default Welcome;

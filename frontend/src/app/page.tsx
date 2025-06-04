"use client";

import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { setCurrentUser, setUserName } from "@/lib/features/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  JoinRoomPayload,
  User,
  WSClientMessage,
  WSClientMessageKind,
} from "../types/shared-types";
import { selectUsers, setUsers } from "@/lib/features/chatSlice";
import { connect, disconnect, send } from "@/lib/features/socketSlice";
import { Button, Input } from "@mantine/core";
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
    <div className="Welcome">
      <header className="Welcome-header">
        <h1>Welcome to my cool chat app!</h1>
        <div>
          <h2>Please input your name</h2>
          <input
            onKeyDown={(e) => {
              handleKeyDown(e);
            }}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            type="text"
          ></input>
        </div>
        <button
          onClick={() => {
            goToChat();
          }}
          style={{ padding: "5px" }}
        >
          Go to chat room
        </button>
      </header>
    </div>
  );
}

export default Welcome;

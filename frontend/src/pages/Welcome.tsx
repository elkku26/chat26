import React, { useState } from "react";
import { useNavigate } from "react-router";
import { setCurrentUser, setUserName } from "../features/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { sendMsg } from "../websocket";
import { v4 as uuidv4 } from "uuid";
import {
  JoinRoomPayload,
  User,
  WSClientMessageKind,
} from "../types/shared-types";
import { selectUsers, setUsers } from "../features/chatSlice";
function Welcome() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const dispatch = useDispatch();

  const users = useSelector(selectUsers);

  async function goToChat() {
    dispatch(setUserName(username));

    let response = await sendMsg({
      msg_id: uuidv4(),
      kind: WSClientMessageKind.JoinRoom,
      payload: {
        username: username,
      } as JoinRoomPayload,
    });
    let newUser = response.data as User;

    dispatch(setUsers([...users, newUser]));
    dispatch(setCurrentUser(newUser));

    navigate("/chat");
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

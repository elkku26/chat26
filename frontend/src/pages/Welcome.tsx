import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { setUserName } from '../features/userSlice';
import { useDispatch } from 'react-redux';
import { sendMsg } from '../websocket'
import { v4 as uuidv4 } from 'uuid';
import { JoinRoomPayload, WSClientMessageKind } from '../types/shared-types';
function Welcome() {

  const navigate = useNavigate();
  const [name, setName] = useState("")
  const dispatch = useDispatch();

  async function goToChat() {
    dispatch(setUserName(name));
    
    console.log("WSS_ENDPOINT is", process.env.REACT_APP_WS_ENDPOINT)

    sendMsg(
      {
        id: uuidv4(), 
        kind: WSClientMessageKind.JoinRoom,
        payload: {
          user_id: uuidv4()
        } as JoinRoomPayload //we need to explicitly check the shape of the payload
      }
    )
    

    navigate("/chat")
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      goToChat()
    }
  }

  return (
    <div className="Welcome">
      <header className="Welcome-header">
        <h1>
          Welcome to my cool chat app!
        </h1>
        <div>
          <h2>Please input your name</h2>
          <input onKeyDown={(e) => { handleKeyDown(e) }} onChange={(e) => { setName(e.target.value) }} type="text"></input>
        </div>
        <button onClick={() => { goToChat() }} style={{ "padding": "5px" }}>Go to demo room</button>

      </header>
    </div>
  );
}

export default Welcome;

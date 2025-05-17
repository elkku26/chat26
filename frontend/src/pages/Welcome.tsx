import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { selectUserId, setUserName, setUserUuid } from '../features/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { sendMsg } from '../websocket'
import { v4 as uuidv4 } from 'uuid';
import { CreateUserPayload, JoinRoomPayload, WSClientMessageKind } from '../types/shared-types';
function Welcome() {

  const navigate = useNavigate();
  const [name, setName] = useState("")
  const dispatch = useDispatch();
  const user_id = useSelector(selectUserId);


  async function goToChat() {
    dispatch(setUserName(name));
    
    console.log("WSS_ENDPOINT is", process.env.REACT_APP_WS_ENDPOINT)


    const response = await fetch(
      `${process.env.REACT_APP_REST_ENDPOINT}:${process.env.REACT_APP_REST_PORT}/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"  
        },
        body: JSON.stringify({
          username: name
        } as CreateUserPayload)
      }
      )

      dispatch(setUserUuid(await response.text()))


    sendMsg(
      {
        id: uuidv4(), 
        kind: WSClientMessageKind.JoinRoom,
        payload: {
          user_id: user_id
        } as JoinRoomPayload
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { setUserName } from '../features/userSlice';
import { useDispatch } from 'react-redux';
import { sendMsg } from '../websocket'
import { v4 as uuidv4 } from 'uuid';

function Welcome() {

  const navigate = useNavigate();

  async function goToChat() {
    dispatch(setUserName(name));
    let response = await sendMsg(
      {
        id: uuidv4(), 
        kind: {
        EnterRoom: {
           username: name,
           time: new Date().toISOString(),
           },
      },
      
    }
  )
    console.log("response: ", JSON.stringify(response))
    navigate("/chat")
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      goToChat();
    }
  }

  const [name, setName] = useState("")
  const dispatch = useDispatch();
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
        <button onClick={() => { goToChat() }} style={{ "padding": "5px" }}>Go to chat</button>

      </header>
    </div>
  );
}

export default Welcome;

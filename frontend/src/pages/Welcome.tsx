import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { setUserName } from '../features/userSlice';
import { useDispatch } from 'react-redux';
import { Message } from '../../../backend/bindings/Message'
import { sendMsg } from '../websocket'
function Welcome() {
  const navigate = useNavigate();

  function goToChat() {
    dispatch(setUserName(name));
    sendMsg({"EnterChat": {username: name, time: new Date().toISOString()}} as Message)
  }

  function handleKeyDown(e : React.KeyboardEvent<HTMLInputElement>) {
    console.log("heya")
    if (e.key === "Enter") {
      navigate("/chat")
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
          <input onKeyDown={(e)=>{handleKeyDown(e)}} onChange={(e)=>{setName(e.target.value)}} type="text"></input>
        </div>
        <NavLink to={"/chat"}>
        <button onClick={()=>{goToChat()}}style={{"padding": "5px"}}>Go to chat</button>
        </NavLink>
        
        </header>
    </div>
  );
}

export default Welcome;

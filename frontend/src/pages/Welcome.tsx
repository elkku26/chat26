import React, { useState } from 'react';
import { NavLink } from 'react-router';
import { setUserName } from '../features/userSlice';
import { useDispatch } from 'react-redux';

function Welcome() {
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
          <input onChange={(e)=>{setName(e.target.value)}} type="text"></input>
        </div>
        <NavLink to={"/chat"}>
        <button onClick={()=>{dispatch(setUserName(name))}}style={{"padding": "5px"}}>Go to chat</button>
        </NavLink>
        
        </header>
    </div>
  );
}

export default Welcome;

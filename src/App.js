import React from 'react';
import { useState } from 'react';

import './App.css';
import ChatRoom from './views/ChatRoom/ChatRoom.js'
import EnterRoom from './views/EnterRoom/EnterRoom.js'

export default function App() {
  const urlSearchParams = new URLSearchParams(window.location.search)
  const params = Object.fromEntries(urlSearchParams.entries())
  
  const [ name, setName ] = useState('Liam-react');
  const [ roomName, setRoom ] = useState(params.room);
  const [ roomKey, setKey ] = useState('test');
  
  // TODO: Vue3 Verion saves room to localstorage

  return (
    <div className="App">
      {
        !!name && !!roomName && !!roomKey
          ? <ChatRoom name={name} roomName={roomName} roomKey={roomKey} />
          : <EnterRoom setName={setName} roomName={roomName} setRoom={setRoom} setKey={setKey} />
      }
    </div>
  );
}


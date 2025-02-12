import React from 'react';
import { useState } from 'react';

import EnterRoom from './views/EnterRoom/EnterRoom.js'

import './App.css';
import './App.css';


export default function App() {
  const urlSearchParams = new URLSearchParams(window.location.search)
  const params = Object.fromEntries(urlSearchParams.entries())
  
  const [ name, setName ] = useState();
  const [ room, setRoom ] = useState(params.room);
  const [ key, setKey ] = useState();
  
  // TODO: Vue3 Verion saves room to localstorage

  return (
    <div className="App">
      {
        !!name && !!room && !!key
          ? 'Show Chat room'
          : <EnterRoom setName={setName} room={room} setRoom={setRoom} setKey={setKey} />
      }
    </div>
  );
}


import React from 'react';

import './SideBar.css';

import { Button } from 'react-bootstrap';
import CloseIcon from "@react-md/material-icons/CloseIcon";
import LockIcon from "@react-md/material-icons/LockIcon";
import ShareIcon from "@react-md/material-icons/ShareIcon";

export default function SiderBar({ room, setRoomEncryptStatus, setMessages, setKey }) {
    function clearChat() {
        setMessages([]);
    }
    function encryptChat() {
        setRoomEncryptStatus(true);
    }
    function copyLink() {
       navigator.clipboard.writeText(window.location.href);
       alert('Link copied to clipboard');
     }
     function leaveRoom() {
        setKey(null);
     }

    return (
      <div id="Side-Bar">
            <div id="side-bar-title" class="ellipsis">
                { room.room }
            </div>

            <div id="users-container">
                { room.users.map((_user, _index) => <div class="ellipsis" key={_user+'_'+_index}> { _index+1 }. { _user } </div>) }
            </div>

            <hr />

            <div class="action-row clickable" onClick={clearChat}>
                <CloseIcon /> <span> Clear Chat </span>
            </div>

            <div class="action-row clickable" onClick={encryptChat}>
                <LockIcon /> <span> Encrypt Chat </span>
            </div>

            <div class="action-row clickable" onClick={copyLink}>
                <ShareIcon /> <span> Copy Link </span>
            </div>

            <Button variant="primary" onClick={leaveRoom}>
                Exit
            </Button>
      </div>
    );
}
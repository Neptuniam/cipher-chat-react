import React from 'react';
import { useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import { getKey, encryption, decryption } from "../../services/util.translate.js"
import './ChatRoom.css';
import SideBar from '../../components/SideBar/SideBar.js';
import Message from '../../components/Message/Message.js';

import { Button } from 'react-bootstrap';

export default function ChatRoom({ name, roomName, roomKey, setKey }) {
    const [ messages, setMessages ] = useState([]);
    const [ newMessage, setNewMessage ] = useState();
    const [ unlockKey, setUnlockKey ] = useState([]);
    const [ isTyping, setIsTyping ] = useState();
    const [ room, setRoom ] = useState({ });
    const [ usersTyping, setUsersTyping ] = useState([]);
    const [ activeUsers, setActiveUsers ] = useState([]);
    let timer

    getKey(roomKey);
    const clientID = uuidv4();
    const socketUrl = `wss://apps.carterbourette.ca/chat/rooms/${roomName}/users/${name}`;
    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
        onOpen: () => sendMessage("5209ac21-2004-4f17-bdf4-b2e66d4ce50f"),
        shouldReconnect: () => true
    });

    useEffect(() => {
        async function handleMessage(_json) {
            if (_json.event === "joined" || _json.event === "left") {
                setRoom(_json);
                await pushMessage(_json)
                attemptNotification()
                scrollToBottom()
            } else if (_json && _json.payload) {
                if (_json.payload.type === "action") {
                    const _text = decryption(_json.payload.text)
                    const author = _json.payload.author
                    let index
            
                    switch (_text) {
                        case "IS_TYPING":
                            usersTyping.push(author);
                            setUsersTyping(usersTyping);
                            break
                        case "IS_NOT_TYPING":
                            index = usersTyping.indexOf(author)
                            if (index > -1) {
                                usersTyping.splice(index, 1)
                                setUsersTyping(usersTyping);
                            }
                
                            break
                
                        case "IS_FOCUSED":
                            // Should only exist in list once
                            index = activeUsers.indexOf(author)
                            if (index === -1) {
                                activeUsers.push(author)
                                setActiveUsers(activeUsers);
                            }
                            break
                        case "IS_NOT_FOCUSED":
                            index = activeUsers.indexOf(author)
                            if (index > -1) {
                                activeUsers.splice(index, 1)
                                setActiveUsers(activeUsers);
                            }
                
                            break
                        default:
                            console.error('Invalid messge type received', _json)
                    }
                } else if (_json.payload.author !== name) {
                    const _text = decryption(_json.payload.text)
            
                    attemptNotification()
            
                    await pushMessage(_json.payload)
                    scrollToBottom()
            
                    if (_text.toLowerCase().includes(`@${name.toLowerCase()}`)) {
                        // showTagged()
                        alert(`${decryption(_json.payload.author)} tagged you in a message`)
                    }
                }
            }
        }

        if (!!lastMessage?.data)
            handleMessage(JSON.parse(lastMessage?.data));
    }, [lastMessage, activeUsers, name, usersTyping]);

    function scrollToBottom() {
        let messengersContainer = document.getElementById("chat-messages-container");
      
        if (messengersContainer)
            messengersContainer.scroll({
                top: messengersContainer.scrollHeight,
                behavior: "smooth",
            });
    }
    function uuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
            (
                c ^
                (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
            ).toString(16)
        )
    }
    function setRoomEncryptStatus(status) {
        setMessages(messages.map(_message => ({ ..._message, isEncrypted: status })));
    }
    function handleInput(e) {
        setNewMessage(e.target.value);

        if (!isTyping)
            sendText("IS_TYPING", "action")
      
        setIsTyping(true)
      
        // once they stop typing for 2 seconds or send, we clear timeout
        clearTimeout(timer)
        timer = setTimeout(() => {
          sendText("IS_NOT_TYPING", "action")
          setIsTyping(false)
        }, 2000)
    }
    function testUnlockKey() {
        if (unlockKey === roomKey) {
            setRoomEncryptStatus(false);
            setUnlockKey(null);
        }
    }

    function attemptNotification() {
        // Only send notifications if player is not on screen
        // showNewMessage();
    }

    function pushMessage(message) {
        messages.push(message);
        setMessages(messages);
    }

    function slashCommand() {
        const original = newMessage
        const multi = original.split(" ")
        const cmd = multi.shift()
      
        switch (cmd) {
          case "/shrug":
            // eslint-disable-next-line no-useless-escape
            return "¯\_(ツ)_/¯"
          case "/scroll":
            return `<marquee>${multi.join(" ")}</marquee>`
          case "/room":
            return `
            ${roomName}\n${room.users.map(_user => {
                let status = "(Not Active)"
                if (name === _user) {
                    status = "(You)"
                } else if (activeUsers.find(_activeUser => decryption(_activeUser) === _user)) {
                    status = "(Active)"
                }
        
                return `* ${_user} ${status}`
            }).join('\n')}
            `
          case "/encrypt":
            setRoomEncryptStatus(true)
            return
          case "/clear":
            setMessages([]);
            return
          case "/help":
          case "/h":
            return `#### Slash Command Help
                * \`/shrug\`: just cause
                * \`/scroll <msg>\`: add absurd scrolling effects
                * \`/room\`: room info
                * \`/encrypt\`: encrypt history
                * \`/clear\`: clear chat history
                * \`/help\`: help text
            `
            default:
                return original
        }
    }

    // Send text to all users through the server
    async function sendText(message, type = "message") {
        if (!message)
            return;
    
        // Construct a msg object containing the data the server needs to process the message from the chat client.
        var msg = {
            type,
            room: encryption(roomName),
            author: encryption(name),
            text: encryption(message),
            id: clientID,
            date: Date.now()
        };
    
        // Send the msg object as a JSON-formatted string.
        await sendMessage(JSON.stringify(msg), []);
    
        if (type === "message" || type === "image")
            pushMessage(msg);
        scrollToBottom();
    }
    async function submitMessage() {
        // Send images with the message
        // if (actionBarRef && actionBarRef.value && actionBarRef.value.sendImage)
        //   actionBarRef.value.sendImage()
      
        let msg = newMessage
      
        if (msg[0] === "/") {
          msg = slashCommand()
        }
      
        await sendText(msg);
        setNewMessage('');
        scrollToBottom();
      
        clearTimeout(timer);
        sendText("IS_NOT_TYPING", "action");
        setIsTyping(false)
    }

    const containsEncrypted = !!messages.find(_message => _message.isEncrypted);

    return (
        <div id="chat-room">
            <div id="chat-messages-container" className={ containsEncrypted ? 'shortened-message-container' : '' }>
                { 
                    readyState !== ReadyState.OPEN 
                        ? <h3 style={ {'marginTop': '30px' }}>Connecting to WebSocket</h3>
                        : messages.map(_message => <Message name={name} message={_message} key={_message.id || _message.timestamp} /> )
                }
            </div>

            { 
                containsEncrypted && <div id="unlock-key">
                        <div>
                            <input value={unlockKey} onChange={e => setUnlockKey(e.target.value)} placeholder="Unlock Key" type="password" />

                            <Button variant="secondary" onClick={testUnlockKey}>
                                Submit
                            </Button>
                        </div>
                    </div>
            }

            <div id="form-container">
               <textarea value={newMessage} onChange={handleInput} placeholder="New Message" rows="3"></textarea>

                <Button variant="primary" size="lg" onClick={submitMessage}>
                    SEND
                </Button>
            </div>

            { usersTyping.map(_user => <span key={`${_user}_typing`}> {decryption(_user)} is typing... </span>)}

            { room?.room && <SideBar room={room} setRoomEncryptStatus={setRoomEncryptStatus} setMessages={setMessages} setKey={setKey} /> }
        </div>
    )
}
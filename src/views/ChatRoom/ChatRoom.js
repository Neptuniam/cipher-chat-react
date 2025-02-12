import React from 'react';
import { useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import './ChatRoom.css';
import { Button } from 'react-bootstrap';

import { getKey, encryption, decryption } from "../../services/util.translate.js"
 
function ActionMessage({ name, message }) {
    return (
        <div>
            { message.user } { message.user !== name ? 'joined' : 'left' }
        </div>
    )
}
function Message({ name, message }) {
    const fromActiveUser = name === decryption(message.author);
    const color = uniqueColour(decryption(message.author));

    let _message, _author;
    if (!message.isEncrypted) {
        _message = decryption(message.text);
        _author = decryption(message.author);
    } else {
        _message = message.text;
        _author = message.author;
    }

    function uniqueColour(name, s = 30, l = 40) {
        let hash = 0
        for (var i = 0; i < name.length; i++)
            hash = name.charCodeAt(i) + ((hash << 5) - hash)
        return "hsl(" + (hash % 360) + ", " + s + "%, " + l + "%)"
    }

    function zeroPadding(num, digit = 2) {
        var zero = ""
        for (var i = 0; i < digit; i++) zero += "0"
            return (zero + num).slice(-digit)
    }

    function readableDateTime(time) {
        const _date = new Date(time)
        let _hours = _date.getHours()
        let zone = "am"

        if (_hours > 12) {
            _hours -= 12
            zone = "pm"
        }

        return `${_hours}:${zeroPadding(_date.getMinutes())}${zone}`
    }

    return (
        <div id="message-container" className={ fromActiveUser ? 'sent' : 'received' }>
            <div id="message">
                { _message }
            </div>
    
            <div id="author" style={{ color }}>
                { _author }
            </div>
    
            <div id="dateTime">
                { readableDateTime(message.date) }
            </div>
        </div>
    );
}

export default function ChatRoom({ name, roomName, roomKey }) {
    const [ messages, setMessages ] = useState([]);
    const [ newMessage, setNewMessage ] = useState();
    const [ isTyping, setIsTyping ] = useState();
    const [ room, setRoom ] = useState({});
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

        if (!!lastMessage?.data) {
            const _json = JSON.parse(lastMessage?.data)
            console.log('data', _json);
          
            handleMessage(_json);
        }
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
        messages.forEach((_message) => {
          _message.isEncrypted = status;
        });
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

      
    
    function attemptNotification() {
        // Only send notifications if player is not on screen
        // showNewMessage();
    }

    function pushMessage(message) {
        console.log('pushing message', message);
        
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

    return (
        <div id="chat-room">
            <div id="chat-messages-container">
                { 
                    readyState !== ReadyState.OPEN 
                        ? <h3 style={ {'marginTop': '30px' }}>Connecting to WebSocket</h3>
                        : messages.map(
                            _message => _message.event === 'joined'
                                ? <ActionMessage name={name} message={_message} key={_message.id || _message.timestamp} />
                                : <Message name={name} message={_message} key={_message.id || _message.timestamp} />
                        )
                }
            </div>

            <div id="form-container">
               <textarea value={newMessage} onChange={handleInput} placeholder="New Message" rows="3"></textarea>

                <Button variant="primary" size="lg" onClick={submitMessage}>
                    SEND
                </Button>
            </div>

            { usersTyping.map(_user => <span key={`${_user}_typing`}> {decryption(_user)} is typing... </span>)}
        </div>
    )
}
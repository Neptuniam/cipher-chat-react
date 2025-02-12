import React from 'react';
import { decryption } from "../../services/util.translate.js"

import './Messages.css';

function ActionMessage({ name, message }) {
    // Ignore actions for ourselves
    if (message.user === name)
        return null;

    return (
        <div>
            { message.user } { message.event === 'joined' ? 'joined' : 'left' }
        </div>
    );
}

function TextMessage({ name, message }) {
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
    
            <div id="date-time">
                { readableDateTime(message.date) }
            </div>
        </div>
    );
}

export default function Message({ name, message }) {
    return message.event === 'joined' || message.event === 'left'
        ? <ActionMessage name={name} message={message} />
        : <TextMessage name={name} message={message} />;
}
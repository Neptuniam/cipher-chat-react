import React from 'react';
import { useState } from 'react';

import './EnterRoom.css';
import { Form, Button } from 'react-bootstrap';
 
export default function EnterRoom({ setName, roomName, setRoom, setKey }) {
    const [ errors, setErrors ] = useState([]);

    // We only want to save the options to the main state if submitForm accepts the whole form
    // So we need a local version of state for editing
    const [ _name, _setName ] = useState();
    const [ _room, _setRoom ] = useState(roomName);
    const [ _key, _setKey ] = useState();

    function submitForm() {  
        let errors = [];

        if (!_name) {
          errors.push("Name is required");
        } if (!_room) {
          errors.push("Room Name is required");
        } if (!_key) {
          errors.push("Encryption Key is required");
        } 
        
        setErrors(errors);

        if (!errors?.length) {
            // If passed all checks, save to main state, jumping to the chat room
            setName(_name);
            setRoom(_room);
            setKey(_key);
        }
      }

    return (
        <>
            <h1>Welcome to Cipher Chat!</h1>

            <h3>Please enter your custom encryption key</h3>

            <Form>
                <Form.Group className="mb-4" controlId="Form.Name">
                    <Form.Label>Your Username</Form.Label>
                    <Form.Control value={_name} onChange={e => _setName(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-4" controlId="Form.Name">
                    <Form.Label>Room Name</Form.Label>
                    <Form.Control value={_room} onChange={e => _setRoom(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-5" controlId="Form.Name">
                    <Form.Label>Encryption Key</Form.Label>
                    <Form.Control value={_key} onChange={e => _setKey(e.target.value)} type="password" />
                </Form.Group>
            </Form>

            <Button variant="primary" size="lg" onClick={submitForm}>
                Submit
            </Button>

            { !!errors?.length && <div style={{ 'padding-top': '40px' }}>
                { errors.map((_error, _index) => <div class="error-message">{_index+1}. {_error}</div>) }
            </div> }
        </>
    )
}
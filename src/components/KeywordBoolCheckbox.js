import React, {useEffect, useState} from 'react';
import {useWebSocket} from "../context/WebSocketContext";

function KeywordBoolCheckbox({keyword, label, makeConfirm}) {
    const {sendMessage, messages} = useWebSocket();
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        const message = messages.find((msg) => msg.key === keyword);
        if (message) {
            let newVal = message.value;
            newVal = newVal.toLowerCase();
            setIsChecked(newVal === 'true' || newVal === 'on' || newVal === 'yes' || newVal === '1');
        } else {
            setIsChecked(false); // Default to false if message is not found
        }
    }, [messages, keyword]);

    const keyArray = keyword.split(".");
    let key = keyArray[1];


    const handleChecked = () => {

        // setAcutalChecked(!actualChecked);
        const userConfirmed = !makeConfirm || window.confirm(`Confirm ${key} checkbox click`);
        if(userConfirmed){
            const newChecked = !isChecked
            setIsChecked(newChecked);
            const message = { "type": "modify", "request_id": null, "key":keyword, "value":newChecked ? 'True' : 'False'};
            sendMessage(message);
        }

    }

    const displayBox = () => (
        <input
            type="checkbox"
            onChange={handleChecked}
            checked={isChecked}
        />
    );


    return (
        <div style={{fontSize: 10, margin:5}}>
            <label>
            {label ? label : `${key}: `}
                {displayBox()}
            </label>
        </div>
    );
}

export default KeywordBoolCheckbox;
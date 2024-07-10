import React, {createContext, useState, useEffect, useCallback, useContext,} from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({url, children}) => {
    const [messages, setMessages] = useState([]);
    const [ws, setWs] = useState(null);
    const [requests, setRequests] = useState([]);
    // const [error, setError] = useState(null);
    const [reqIdCounter, setReqIdCounter] = useState(1);


    const closeConnection = useCallback(() => {
        if (ws) {
            ws.close();
        }
    }, [ws]);



    useEffect(() => {

        const wsClient = new WebSocket(url);

        wsClient.onopen = () => {
            // wsClient.send("-c&-jsonfragments&-prefix&-s&sca%");
            // wsClient.send("-c&-jsonfragments&-prefix&-s&pie&!&slow&!&%timeout");
            // ---- adjust serviceName ----
            const serviceName = 'pie';
            wsClient.send(`-c&-jsonfragments&-prefix&-s&${serviceName}`);
            console.log('Connection to WebSocket server');

        };

        wsClient.onmessage = (message) => {
            //console.log(message);
            let parsedMessage;
            try{
                const oneMessage = message.data;
                const processedData = oneMessage.replace(/\binf\b/g, '"Infinity"');

                //console.log(`processedData: ${processedData}`)
                parsedMessage = JSON.parse(processedData);
                function convertInfinity(obj){
                    for(const key in obj){
                        if(obj[key] === "Infinity"){
                            obj[key] = Infinity;
                            console.log(obj[key]);
                        }else if(typeof obj[key] === 'object' && obj[key] !== null){
                            convertInfinity(obj[key]);
                        }
                    }
                }

                convertInfinity(parsedMessage);

                if(parsedMessage.type && parsedMessage.request_id) {
                    if(parsedMessage.errcode !== "SUCCESS"){
                        alert(`Error: ${parsedMessage.msg}`)
                        // console.log(`request: ${parsedMessage.request_id}  error: ${parsedMessage.msg}`)
                    }else(
                        alert(`${parsedMessage.errcode}`)
                        // console.log(`request: ${parsedMessage.request_id} was a ${parsedMessage.errcode}`)
                    )
                    setRequests((prevMessages) => [...prevMessages, parsedMessage]);

                }
                //console.log(requests.length)
                else if(parsedMessage.key && parsedMessage.value){
                    setMessages((prevMessages) => {
                        // Check if parsedMessage is already in prevMessages
                        const existingMessage = prevMessages.find(msg => msg.key === parsedMessage.key);

                        if (existingMessage) {
                            // If the message already exists, update its value
                            return prevMessages.map(msg =>
                                msg.key === parsedMessage.key ? { ...msg, value: parsedMessage.value } : msg
                            );
                        } else {
                            // Otherwise, add the new message to the array
                            return [...prevMessages, parsedMessage];
                        }
                    });
                }

            } catch(error) {
                console.error(`Error parsing JSON: `, error);
            }

            // const parsedMessage = JSON.parse(message.data);


            // console.log(parsedMessage)
            //console.log(`Received message: ${parsedMessage.key} : ${parsedMessage.value}`);


        };
        setWs(wsClient);

        wsClient.onclose = () => {
            console.log('Disconnected from the WebSocket server');
        };

        wsClient.onerror = (e) => {
            console.error(`WebSocket error: ${e}`);
        };

        return () => {
            wsClient.close();
        }
    }, [url]);

    const sendMessage = useCallback((message) => {
        if(ws && ws.readyState === WebSocket.OPEN){
            message.request_id = reqIdCounter;
            setReqIdCounter(prevCounter => prevCounter + 1);
            // console.log(`sending: ${JSON.stringify(message)}`)
            ws.send(JSON.stringify(message));
        }else{
            console.error("WebSocket is not open")
        }
    }, [ws, reqIdCounter]);

    return (
        <WebSocketContext.Provider value={{messages, closeConnection, sendMessage, ws, requests}}>
            {children}
        </WebSocketContext.Provider>
);
}

export const useWebSocket = () => useContext(WebSocketContext);
import WebSocket from 'ws'

// Create a WebSocket connection
const ws = new WebSocket('wss://doralyn-onotsf-fast-mainnet.helius-rpc.com');


// Function to send a request to the WebSocket server
function sendRequest(ws: WebSocket) {
    const request = {
        jsonrpc: "2.0",
        id: 420,
        method: "transactionSubscribe",
        params: [
            "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // pubkey of account we want to subscribe to
            {
                encoding: "jsonParsed", // base58, base64, base65+zstd, jsonParsed
                commitment: "confirmed", // defaults to finalized if unset
            }
        ]
    };
    ws.send(JSON.stringify(request));
}

// Function to send a ping to the WebSocket server
function startPing(ws: WebSocket) {
    setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.ping();
            console.log('Ping sent');
        }
    }, 30000); // Ping every 30 seconds
}

// Define WebSocket event handlers

ws.on('open', function open() {
    console.log('WebSocket is open');
    sendRequest(ws);  // Send a request once the WebSocket is open
    startPing(ws);    // Start sending pings
});

ws.on('message', function incoming(data) {
    const messageStr = data.toString('utf8');
    try {
        const messageObj = JSON.parse(messageStr);
        console.log('Received:', messageObj);
        messageObj.params ? console.log(messageObj.params.result.value.signature) : console.log('asdf')
    } catch (e) {
        console.error('Failed to parse JSON:', e);
    }
});

ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
});

ws.on('close', function close() {
    console.log('WebSocket is closed');
});
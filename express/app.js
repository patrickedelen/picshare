const express = require('express');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const app = express();
const defaultExpressPort = 8080;
const defaultWebSocketPort = 8081;

const wss = new WebSocket.Server({ port: defaultWebSocketPort });

const openIds = []

const getNewId = () => {


}
const openWsConnections = []

const initClient = (ws) => {
    const newId = uuidv4();
    openIds.push(newId);
    openWsConnections.push({
        [newId]: ws
    })

    return newId;
}

const removeClient = (id) => {
    const index = openIds.indexOf(id);
    openIds.splice(index, 1);
    delete openWsConnections[id];
}




wss.on('connection', (ws) => {
    console.log('Client connected');
    const clientId = initClient(ws);
    let desktopId = null
    console.log('New id:'+ clientId);
    ws.send(JSON.stringify({
        'type': 'openSuccess',
        'id': clientId
    }))

    ws.on('close', () => {
        console.log('Client disconnected, removing');
        removeClient(clientId);
    })

    ws.on('message', (message) => {
        // console.log(`Received message from ${clientId}:`+ message);
        const data = JSON.parse(message);
        console.log('got message of type', data.type);
        if (data.type === 'phoneIdentify') {
            desktopId = data.desktopId;
            console.log('identified desktop', data)
        }
        if (data.type === 'imageSend') {
            console.log('got image send on server')
            console.log('info on connections:', openWsConnections, )
            console.log('ws id of desktop', desktopId)
            console.log('ws of desktop', openWsConnections[desktopId])
        }
    });

    // ws.send('Hello World');
})

app.get('/test', (req, res) => {
    res.send({ 'message': 'Healthcheck Pass' });
})

app.listen(defaultExpressPort, () => {
    console.log('Server listening on port', defaultExpressPort);
})

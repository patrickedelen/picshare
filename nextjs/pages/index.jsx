import { Image } from 'next/image'
import React, { useEffect, useState } from 'react'
import QRCode from "react-qr-code";

import styles from '../app/main.module.css'


// need array of ids, generate on connection to websocket
// send id to client on websocket connection
// client on mobile site will initialize connection with id from page params

// send 

export default function Index() {

    const [ws, setWs] = useState(null)
    const [qrData, setQrData] = useState(null)

    useEffect(() => {
        const websocket = new WebSocket('ws://localhost:8081')

        websocket.onopen = () => {
            console.log('connected to websocket')
        }

        websocket.onmessage = (event) => {
            console.log('got message', event.data)
            const data = JSON.parse(event.data)

            if (data.type === 'openSuccess') {
                setQrData(`https://b16ac9952843.ngrok.app/${data.id}`)
            }
        }

        setWs(websocket)

        return () => {
            websocket.close()
        }
    }, [])

    const sendMessage = (msg) => {
        ws.send(msg)
    }

    return (
        <div className={styles.container}>
            <h1>Hello World</h1>
            {qrData && (
                <QRCode
                size={256}
                style={{ height: "auto", maxWidth: "400px", width: "100%" }}
                value={qrData}
                viewBox={`0 0 256 256`}
                />
            )}
            <button onClick={() => sendMessage('hello')}>test send</button>
        </div>
    )
}
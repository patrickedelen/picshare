import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import QRCode from "react-qr-code";

import styles from '../app/main.module.css'


// need array of ids, generate on connection to websocket
// send id to client on websocket connection
// client on mobile site will initialize connection with id from page params

// send 

// on websocket message with sent picture, save as file locally
// allow downloading file with a button
// show picture on desktop page

export default function Index() {

    const [ws, setWs] = useState(null)
    const [qrData, setQrData] = useState(null)
    const [file, setFile] = useState(null)

    const [imageSrc, setImageSrc] = useState('')

    useEffect(() => {
        const websocket = new WebSocket('ws://localhost:8081')

        websocket.onopen = () => {
            console.log('connected to websocket')
        }

        websocket.onmessage = (event) => {
            console.log('got message', event.data)
            const data = JSON.parse(event.data)

            if (data.type === 'openSuccess') {
                setQrData(`https://888a45a6a1de.ngrok.app/${data.id}`)
            }
            if (data.type === 'imageReceive') {
                // console.log('got image', data.image)
                setImageSrc(data.image)
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
            <p>link to qr code: {qrData}</p>
            <button onClick={() => sendMessage('hello')}>test send</button>
            {imageSrc && <Image height="400" width="400" src={imageSrc} /> }
        </div>
    )
}
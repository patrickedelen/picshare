import { useRouter } from "next/router";
import React, { useEffect, useState, useRef } from 'react'
import Webcam from 'react-webcam'
import { Image } from 'next/image'

const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

export default function MobileRoute() {
    const router = useRouter();
    const [id, setId] = useState(null)

    useEffect(() => {
        setId(router.query.id)
    }, [router])
    console.log('got router', router)

    const webcamRef = useRef(null);

    const [ws, setWs] = useState(null)
    const [qrData, setQrData] = useState(null)

    const [imageSrc, setImageSrc] = useState(null)

    const [connectionSuccess, setConnectionSuccess] = useState(false)
    const [test, setTest] = useState('')

    useEffect(() => {
        if (!id) {
            console.log('waiting for router query')
        }
        setTest('opening socket...')
        const websocket = new WebSocket('wss://20ad79a69edf.ngrok.app')

        websocket.onerror = (error) => {
            setTest(`error: ${JSON.stringify(error)}`)
        }
        websocket.onopen = () => {
            console.log('connected to websocket')
            setConnectionSuccess(true)
            setTest('connected to websocket')
            
            websocket.send(JSON.stringify({
                type: 'phoneIdentify',
                desktopId: id
            }))
        }

        websocket.onmessage = (event) => {
            console.log('got message of type', event.type)
            const data = JSON.parse(event.data)

            if (data.type === 'openSuccess') {
                setQrData(`https://b16ac9952843.ngrok.app/${data.id}`)
            }
        }

        setWs(websocket)

        return () => {
            websocket.close()
        }
    }, [id])

    const capture = React.useCallback(
        () => {
          const imageSrc = webcamRef.current.getScreenshot();
          ws.send(JSON.stringify({ type: 'imageSend', data: imageSrc }))
        },
        [webcamRef, ws]
      );

    return (
        <div>
            <h1>hello world</h1>
            {connectionSuccess && (
                <h1>got connection</h1>
            )}
            <h2>test: {test}</h2>

            <Webcam
                audio={false}
                height={720}
                screenshotFormat="image/jpeg"
                width={1280}
                videoConstraints={videoConstraints}
                ref={webcamRef}
            />
            <button onClick={capture}>Capture photo</button>
            
        </div>
    );
}
import { useRouter } from "next/router";
import React, { useEffect, useState, useRef } from 'react'
import Webcam from 'react-webcam'
import { Image } from 'next/image'

import { Loading } from '@nextui-org/react'
import { Button } from '@nextui-org/react'
import { motion, AnimatePresence } from 'framer-motion'

import styles from '../app/upload.module.css'

const videoConstraints = {
    facingMode: "environment"
}

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
            setTest('connected to websocket')
            setTimeout(() => {
                setConnectionSuccess(true)
            }, 1000)
            
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
        <div className={styles.container}>
            <div className={styles.titleContainer}>

            <AnimatePresence>
                {!connectionSuccess ? (
                    <motion.div 
                        key="a"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        className={styles.connectionWaiting}
                    >
                        <h3>Waiting for connection</h3>
                        <Loading type="points" />
                        
                    </motion.div>
                ) : (
                    <motion.div 
                        key="b"
                        initial={{ opacity: 0, transition: { delay: 0.2 } }}
                        animate={{ opacity: 1, transition: { delay: 0.2 } }}
                        exit={{ opacity: 0 }}
                        className={styles.connectionWaiting}
                    >
                        <h3>Connected to desktop</h3>
                    </motion.div>
                )}
            </AnimatePresence>
            </div>

            <Webcam
                width={350}
                height={263}
                className={styles.uploadWebcam}
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                forceScreenshotSourceSize={true}
                screenshotQuality={1}
            />
            <Button color="black" bordered shadow onClick={capture}>Take Photo</Button>
            
        </div>
    );
}
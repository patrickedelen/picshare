import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import QRCode from "react-qr-code";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMobileScreen } from '@fortawesome/free-solid-svg-icons';

import { Loading, Button, Input } from '@nextui-org/react'
import { AnimatePresence, motion } from 'framer-motion'
import Confetti from 'react-confetti'

import styles from '../app/main.module.css'


// need array of ids, generate on connection to websocket
// send id to client on websocket connection
// client on mobile site will initialize connection with id from page params

// on websocket message with sent picture, save as file locally
// allow downloading file with a button
// show picture on desktop page

export default function Index() {

    const [ws, setWs] = useState(null)
    const [qrData, setQrData] = useState(null)
    const [loadingConnection, setLoadingConnection] = useState(true)
    const [phoneConnected, setPhoneConnected] = useState(false)
    const [buttonClicked, setButtonClicked] = useState(false)
    const [showCompleteView, setShowCompleteView] = useState(false)
    const [downloadLinkClicked, setDownloadLinkClicked] = useState(false)

    const [imageSrc, setImageSrc] = useState('')

    useEffect(() => {
        const websocket = new WebSocket('wss://api-aws.xnmz.co:8080')

        websocket.onopen = () => {
            console.log('connected to websocket')
            setTimeout(() => {
                setLoadingConnection(false)
            }, 1500)
        }

        websocket.onmessage = (event) => {
            console.log('got message', event.data)
            const data = JSON.parse(event.data)

            if (data.type === 'openSuccess') {
                setQrData(`https://picshare-pedelen.vercel.app/${data.id}`)
            }
            if (data.type === 'imageReceive') {
                // console.log('got image', data.image)
                setImageSrc(data.image)
            }
            if (data.type === 'phoneConnected') {
                setPhoneConnected(true)
            }
        }

        setWs(websocket)

        return () => {
            websocket.close()
        }
    }, [])

    const onButtonClick = () => {
        setButtonClicked(true)
        setShowCompleteView(true)
    }

    const downloadImage = () => {
        const link = document.createElement('a');
        link.href = imageSrc;
        link.download = 'mobile_upload.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadLinkClicked(true)
    }

    return (
        <div className={styles.container}>
            {
                buttonClicked && (
                    <Confetti
                        height={1200}
                    />
                )
            }

            <div className={styles.infoContainer}>
                <h2>You are the desktop user!</h2>
                <h3>Scan the QR code to connect to your phone.</h3>
                <p>Your data is never stored on our servers, just transmitted from your phone to your desktop.</p>
            </div>

            <motion.div className={styles.presenceContainer}>
                <AnimatePresence>
                    {showCompleteView ? (
                        <motion.div
                            key="complete"
                            className={styles.formContainer}
                            initial={{ opacity: 0, transition: { delay: 0.5 } }}
                            animate={{ opacity: 1, transition: { delay: 0.5 } }}
                            exit={{ opacity: 0 }}
                        >
                            <h3>Thanks for trying out the demo!</h3>
                            <h4>Check out the github repo <a href="https://github.com/patrickedelen/picshare">here</a></h4>
                        </motion.div>

                    ) : (
                        <motion.div
                            key="form"
                            className={styles.formContainer}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        >
                            <div className={styles.infoText}>
                                <h3>Demo signup form you usually hate</h3>
                            </div>

                            <div className={styles.inputContainer}>
                                <Input label="First Name" clearable bordered labelPlaceholder="Name" initialValue="Jim" />
                                <Input label="Last Name" clearable bordered labelPlaceholder="Name" initialValue="Bob" />
                            </div>

                            <div className={styles.fileUploadContainer}>
                                <p>Scan the QR code to upload your identification</p>
                                <p className={styles.tiny}>Please do not actually upload your ID...</p>
                                <p className={styles.linkInfo}>link to qr code: <a href={qrData}>{qrData}</a></p>
                            </div>
                            <div className={styles.uploadPresenceContainer}>
                                <AnimatePresence>
                                    {loadingConnection && (
                                        <motion.div
                                            key="loading"
                                            className={styles.loadingContainer}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, transition: { duration: 0.5 } }}
                                        >
                                            <Loading type="points" size="lg" />
                                        </motion.div>
                                    )}
                                    {(phoneConnected && !imageSrc) && (
                                        <motion.div
                                            key="phoneConnected"
                                            className={styles.mobileConnected}
                                            initial={{ opacity: 0, transition: { delay: 0.5 } }}
                                            animate={{ opacity: 1, transition: { delay: 0.5 } }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <FontAwesomeIcon icon={faMobileScreen} size="10x" color="black" />
                                            <p>Your phone is connected, waiting for an image.</p>
                                        </motion.div>
                                    )}
                                    {(!loadingConnection && qrData && !imageSrc && !phoneConnected) && (
                                        <motion.div
                                        key="qrCode"
                                        initial={{ opacity: 0, transition: { delay: 0.5 } }}
                                        animate={{ opacity: 1, transition: { delay: 0.5 } }}
                                        exit={{ opacity: 0 }}
                                        className={styles.qrCodeGenerated}
                                        >
                                            <QRCode
                                                size={256}
                                                style={{ height: "auto", maxWidth: "268px", width: "100%" }}
                                                value={qrData}
                                                viewBox={`0 0 268 268`}
                                            />
                                            
                                        </motion.div>
                                    )}
                                    {imageSrc && (
                                        <motion.div
                                            key="image"
                                            initial={{ opacity: 0, transition: { delay: 0.5 } }}
                                            animate={{ opacity: 1, transition: { delay: 0.5 } }}
                                            exit={{ opacity: 0 }}
                                            className={styles.imageContainer}
                                        >
                                            <Image height="281" width="500" src={imageSrc} alt="Your uploaded image" /> 
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className={styles.buttonContainer}>
                                <Button auto color="black" bordered shadow disabled={!imageSrc} onClick={onButtonClick}>Do something fun...</Button>
                                <Button auto color={downloadLinkClicked ? 'gradient' : 'black' } bordered shadow disabled={!imageSrc} onClick={downloadImage}>Download Image</Button>

                            </div>
                        </motion.div>
                    )}
            </AnimatePresence>
                
            </motion.div>

            
        </div>
    )
}
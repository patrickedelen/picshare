import { useRouter } from "next/router";
import React, { useEffect, useState, useRef } from 'react'
import Webcam from 'react-webcam'
// import { Image as NextImage } from 'next/image'

import ReactCrop, {
    centerCrop,
    makeAspectCrop,
    Crop,
    PixelCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import { Loading } from '@nextui-org/react'
import { Button, Modal } from '@nextui-org/react'
import { motion, AnimatePresence } from 'framer-motion'

import styles from '../app/upload.module.css'

const videoConstraints = {
    facingMode: "environment",
    audio: false,
    video: true,
    width: { ideal: 3024 },
    height: { ideal: 4032 },
    aspectRatio: 4/3
}

function useDebounceEffect(
    fn,
    waitTime,
    deps,
    ) {
        useEffect(() => {
        const t = setTimeout(() => {
            fn.apply(undefined, deps)
        }, waitTime)
    
        return () => {
            clearTimeout(t)
        }
    }, deps)
}

function centerAspectCrop(
    mediaWidth,
    mediaHeight,
    aspect,
) {
    return centerCrop(
    makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    )
  }

function cropImage(src, crop) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src =  src;
        img.onload = () => {
            console.log('test,', img.width, img.height)
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const targetX = img.width * (crop.x / 100);
            const targetY = img.height * (crop.y / 100);
            const targetWidth = img.width * (crop.width / 100);
            const targetHeight = img.height * (crop.height / 100);

            canvas.width = targetWidth;
            canvas.height = targetHeight;

            ctx.drawImage(img, targetX, targetY, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight);

            const base64 = canvas.toDataURL();
            resolve(base64);
        };
    });
}

export default function MobileRoute() {
    const router = useRouter();
    const [id, setId] = useState(null)

    useEffect(() => {
        setId(router.query.id)
    }, [router])

    const webcamRef = useRef(null);
    const [openCamera, setOpenCamera] = useState(false)

    const [ws, setWs] = useState(null)
    const [qrData, setQrData] = useState(null)

    const [imageSrc, setImageSrc] = useState(null)
    const [photoTaken, setPhotoTaken] = useState(false)
    const imageRef = useRef(null)
    const [crop, setCrop] = useState()
    const [completedCrop, setCompletedCrop] = useState()
    const aspectRatio = (16 / 9)

    const [connectionSuccess, setConnectionSuccess] = useState(false)
    const [imageSent, setImageSent] = useState(false)

    useEffect(() => {
        (async () => {
            const perms = await navigator.permissions.query({ name: 'camera' });
            console.log('camera perms', perms)
            if (perms.state === 'granted') {
                setOpenCamera(true)
            }
        })()
    }, [])

    const getUserPerms = async () => {
        setOpenCamera(true)
    }

    useEffect(() => {
        if (!id) {
            console.log('waiting for router query')
        }
        const websocket = new WebSocket('wss://api-aws.xnmz.co:8080')

        websocket.onerror = (error) => {
            console.error(error)
        }
        websocket.onopen = () => {
            console.log('connected to websocket')
            setTimeout(() => {
                setConnectionSuccess(true)
            }, 1500)
            
            websocket.send(JSON.stringify({
                type: 'phoneIdentify',
                desktopId: id
            }))
        }

        websocket.onmessage = (event) => {
            console.log('got message of type', event.type)
            const data = JSON.parse(event.data)

            if (data.type === 'openSuccess') {
                setQrData(`https://picshare-seven.vercel.app/${data.id}`)
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
            setImageSrc(imageSrc)
            setPhotoTaken(true)
            setCrop(centerAspectCrop(300, 400, aspectRatio))
        },
        [webcamRef, ws]
    );

    // useDebounceEffect(
    //     async () => {
    //     if (
    //         completedCrop?.width &&
    //         completedCrop?.height &&
    //         imgRef.current &&
    //         previewCanvasRef.current
    //     ) {
    //     // We use canvasPreview as it's much faster than imgPreview.
    //     canvasPreview(
    //         imgRef.current,
    //         previewCanvasRef.current,
    //         completedCrop,
    //         scale,
    //         rotate,
    //     )
    //     }
    //     },
    //     100,
    //     [completedCrop],
    // )

    const retake = () => {
        setImageSrc(null)
        setPhotoTaken(false)
        setImageSent(false)
    }

    const sendImage = async () => {
        console.log('sending image')
        const data = await cropImage(imageSrc, crop)
        ws.send(JSON.stringify({ type: 'imageSend', data: data }))
        setImageSent(true)
    }

    return (
        <div className={styles.container}>
            <Modal open={imageSent} onClose={() => setImageSent(false)} width="75%" blur={true}>
                <Modal.Body css={{alignItems: 'center', margin: '10px'}}>
                <h3>Image Sent!</h3>
                <h4>Check your computer</h4>
                </Modal.Body>
            </Modal>
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
                            <h4>Waiting for connection</h4>
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
                            <h4>Connected to desktop</h4>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className={styles.videoContainer}>
                <AnimatePresence>
                {
                    ! openCamera ? (
                        <motion.div 
                            key="c"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            className={styles.videoElement}
                        >
                            <h4>Permissions required</h4>
                            <p>Please allow access to your camera</p>
                            <Button onClick={() => getUserPerms()}>Allow</Button>
                        </motion.div>
                    ) : (openCamera && !photoTaken) ? (
                        <motion.div 
                            key="d"
                            initial={{ opacity: 0, transition: { delay: 0.2 } }}
                            animate={{ opacity: 1, transition: { delay: 0.2 } }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            className={styles.videoElement}
                        >
                            <Webcam
                                width={300}
                                height={400}
                                className={styles.uploadWebcam}
                                ref={webcamRef}
                                audio={false}
                                screenshotFormat="image/jpeg"
                                videoConstraints={videoConstraints}
                                forceScreenshotSourceSize={true}
                                screenshotQuality={1}
                            />
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="e"
                            initial={{ opacity: 0, transition: { delay: 0.2 } }}
                            animate={{ opacity: 1, transition: { delay: 0.2 } }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            className={styles.cropElement}
                        >
                            <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspectRatio}
                            >
                                <img
                                    ref={imageRef}
                                    alt="Crop me"
                                    src={imageSrc}
                                />
                            </ReactCrop>
                        </motion.div>
                        
                    )
                }
                </AnimatePresence>
            </div>
            
            <div className={styles.buttonContainer}>

            <AnimatePresence>
                {
                    ! photoTaken && (
                        <motion.div 
                            key="a"
                            initial={{ opacity: 0, transition: { delay: 0.2 } }}
                            animate={{ opacity: 1, transition: { delay: 0.2 } }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            className={styles.singleButton}
                        >
                            <Button color="black" bordered shadow onPress={capture}>Take Photo</Button>
                        </motion.div>
                        )
                    }
                {
                    photoTaken && (
                        <motion.div 
                        key="c"
                        initial={{ opacity: 0, transition: { delay: 0.2 } }}
                        animate={{ opacity: 1, transition: { duration: 0.2, delay: 0.2 } }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        className={styles.multiButton}
                        >
                            <Button color="black" bordered shadow onPress={retake} auto>Retake</Button>
                            <Button color={imageSent ? 'gradient' : 'black'} bordered shadow auto onPress={sendImage}>{imageSent ? 'Sent!' : 'Send'}</Button>
                        </motion.div>
                    )
                }
            </AnimatePresence>
            </div>
        </div>
    );
}
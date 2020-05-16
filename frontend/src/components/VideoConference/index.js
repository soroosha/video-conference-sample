
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button, Alert } from 'antd';
import { VideoCameraOutlined, AudioOutlined, AudioMutedOutlined } from '@ant-design/icons';

import { ThemeContext } from '../../App'

import Selector from "./Selector"
import Conference from "./Conference"

import styles from "./styles.module.scss"
import { useCacheErrors } from "antd/lib/form/util";

let mediaRetryTimeout

function VideoConference(){
  const [ mediaStream , setMediaStream ] = useState()
  const [ streamError, setStreamError ] = useState()
  const [ roomToJoin, setRoomToJoin ] = useState()
  const [ activeRoom, setActiveRoom ] = useState()
  const [ muted, setMuted ] = useState(false)

  const userVideoRef = useRef(null);

  const connectToUserMedia = useCallback(async ()=>{
    if(mediaRetryTimeout){
      clearTimeout(mediaRetryTimeout)
    }
    const constraints = window.constraints = {
      audio: true,
      video: true
    }
    try{
      const freshStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStreamError(null)
      setMediaStream(freshStream)
    }catch(e){
      setStreamError('Video not available. Please verify browser permissions.')
      mediaRetryTimeout = setTimeout(connectToUserMedia, 1000)
    }
  }, [])

  useEffect(()=>{
    if(mediaStream){
      // const videoTracks = mediaStream.getVideoTracks();
      // console.log('Got stream with constraints:', constraints);
      // if(videoTracks) message.info(`Using video device: ${videoTracks[0].label}`);
      // window.stream = stream; // make variable available to browser console
      if(userVideoRef.current.srcObject !== mediaStream){
        userVideoRef.current.srcObject = mediaStream;
      }
      mediaStream.getAudioTracks()[0].enabled = !muted;
    }else{
      connectToUserMedia()
    }
  }, [muted, connectToUserMedia, mediaStream, userVideoRef])

  const didJoinRoom = useCallback((room)=>{
    setActiveRoom(room)
  }, [])

  const toggleMute = useCallback(()=>{
    setMuted(!muted)
  }, [muted])

  return (
    <ThemeContext.Consumer>
    {({theme}) => (
    <div className={styles.videoConference+' '+styles[theme]}>
      <div className={styles.leftMenu}>
        <div className={styles.userVideo}>
          <video
            autoPlay
            muted
            ref={userVideoRef}
          />
          <div className={styles.options}>
            <Button
              icon={muted? <AudioMutedOutlined/> : <AudioOutlined/>}
              onClick={toggleMute}
            />
          </div>
        </div>
        <Selector
          activeRoom={activeRoom}
          onSelect={setRoomToJoin}
          disabled={!mediaStream}
        />
      </div>
      <div className={styles.conference}>
        {streamError &&
        <div className={styles.error}>
          <Alert message={streamError} type="error" />
        </div>
        }
        <Conference onJoin={didJoinRoom} room={roomToJoin} mediaStream={mediaStream}/>
      </div>
    </div>
    )}
    </ThemeContext.Consumer>
  )
}

export default VideoConference;
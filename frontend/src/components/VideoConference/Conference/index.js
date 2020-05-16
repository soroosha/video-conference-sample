import React, { useState, useEffect, useMemo, useCallback } from "react"
import { message } from "antd"

import { ThemeContext } from '../../../App'
import ConferenceRoom from '../../../utils/confereceRoom'

import styles from "./styles.module.scss"

function Conference({ room, mediaStream, onJoin }){
  const [ peers, setPeers ] = useState([])
  const [ conferenceRoom, setConferenceRoom ] = useState()

  useEffect(()=>{
    if(mediaStream || peers){
      console.log('media stream or peers changed!')
    }
  }, [mediaStream, peers])
  
  useEffect(()=>{
    if(conferenceRoom && (!room || conferenceRoom.room.id!==room.id)){
      conferenceRoom.leaveRoom()
      setPeers([])
    }
    if(room && mediaStream && (!conferenceRoom || conferenceRoom.room.id!==room.id)){
      const newConferenceRoom = new ConferenceRoom(
        room,
        mediaStream,
        {
          onPeersUpdate:(peers)=>{
            setPeers(peers)
          },
          onJoin:()=>{
            message.success({
              content: `Joined ${room.name}`,
              key: 'room_join'
            })
            onJoin(room)
          }
        }
      )
      setConferenceRoom(newConferenceRoom)
    }
  }, [room, mediaStream, conferenceRoom, onJoin])

  const getVideoSizes = useCallback(count => {
    const row_count = Math.round(Math.sqrt(count))
    const col_count = Math.ceil(count/row_count)

    let sizes = []
    for(let i=0;i<count;i++){
      sizes[i]=[`${100/col_count}%`, `${100/row_count}%`]
    }
    return sizes
  }, [])

  const video_sizes = useMemo(()=>{
    return getVideoSizes(peers.length)
  }, [getVideoSizes, peers.length])

  return (
    <ThemeContext.Consumer>
    {({theme}) => (
    <div className={styles.conference+' '+styles[theme]}>
      <div className={styles.videos}>
      {/* {video_sizes.map(size => (
        <div style={{background:'rgba(f,f,f,0.1)',  width:size[0], height:size[1]}}>

        </div>
      ))} */}
      {peers.map((peer,i) => (
        <div
        style={{width:video_sizes[i][0], height:video_sizes[i][1]}}
        key={`peer-${peer.id}`}
        >
          <span>{peer.id}</span>
          <video autoPlay ref={video => { if(video && video.srcObject !== peer.mediaStream) video.srcObject = peer.mediaStream }} />
        </div>
      ))}
      </div>
    </div>
    )}
    </ThemeContext.Consumer>
  )
}

export default Conference;
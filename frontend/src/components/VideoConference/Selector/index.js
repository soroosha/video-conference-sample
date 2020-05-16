import React from "react"
import { Button } from 'antd';
import { VideoCameraOutlined } from '@ant-design/icons';

import { ThemeContext } from '../../../App'

import styles from "./styles.module.scss"

function ConferenceSelector(props){
  const rooms = [{id:1, name:'Lorem'}, {id:2, name:'Ipsum'}, {id:3, name:'Dolor'}]

  // const onRoomClick = useCallback((room)=>{
  //   // alert(e.target)
  //   props.onSelect(room)
  // },[props])

  return (
    <ThemeContext.Consumer>
    {({theme}) => (
    <div className={styles.conferenceSelector+' '+styles[theme]}>
      <div className={styles.title}>
        Rooms
      </div>
      {rooms.map(room => (
        <Button
        icon={(props.activeRoom && props.activeRoom.id === room.id) ? <VideoCameraOutlined />: null}
        key={`room-${room.id}`}
        className={styles.roomButton}
        size="large"
        onClick={()=>props.onSelect(room)}
        disabled={props.disabled || (props.activeRoom && props.activeRoom.id === room.id)}
        >
          {room.name}
        </Button>
      ))}
    </div>
    )}
    </ThemeContext.Consumer>
  )
}

export default ConferenceSelector;
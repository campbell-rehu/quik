import React, { useEffect, useRef } from 'react'
import './Game.css'
import {
  useWebSocketContext,
  WebSocketContextProvider,
} from '../components/WebsocketContext'
import { Room } from './Room'
import { useRoomContext } from '../components/RoomContext'

interface Props {
  hardMode?: boolean
}

export const GameContainer: React.FC<{}> = () => {
  return (
    <WebSocketContextProvider>
      <Setup />
    </WebSocketContextProvider>
  )
}

export const Setup: React.FC<Props> = ({ hardMode }) => {
  const { socket } = useWebSocketContext()
  const createRoomInput = useRef<HTMLInputElement>(null)
  const joinRoomInput = useRef<HTMLInputElement>(null)
  const setPlayerNameInput = useRef<HTMLInputElement>(null)
  const { roomId, playerName, createRoom, joinRoom, setPlayerName } =
    useRoomContext()

  useEffect(() => {
    if (socket) {
      if (!roomId) {
        createRoomInput.current?.focus()
      } else if (!playerName) {
        setPlayerNameInput.current?.focus()
      }
    }
  }, [socket, roomId, playerName])

  if (!roomId) {
    return (
      <>
        <div className='create-room-container'>
          <input
            id='room-name'
            name='room-name'
            type='text'
            ref={createRoomInput}
          />
          <button
            type='button'
            onClick={(e) => {
              var input = document.querySelector(
                '#room-name'
              ) as HTMLInputElement
              createRoom(input.value)
            }}>
            Create room
          </button>
        </div>
        <div className='join-room-container'>
          <input id='room-id' name='room-id' type='text' ref={joinRoomInput} />
          <button
            type='button'
            onClick={(e) => {
              var input = document.querySelector('#room-id') as HTMLInputElement
              joinRoom(input.value)
            }}>
            Join room
          </button>
        </div>
      </>
    )
  }

  if (!playerName) {
    return (
      <div className='set-player-name-container'>
        <input
          id='player-name'
          name='player-name'
          type='text'
          ref={setPlayerNameInput}
        />
        <button
          type='button'
          onClick={(e) => {
            var input = document.querySelector(
              '#player-name'
            ) as HTMLInputElement
            setPlayerName(roomId, socket.id, input.value)
          }}>
          Set Player Name
        </button>
      </div>
    )
  }

  return <Room roomId={roomId} socket={socket} />
}

import React, { PropsWithChildren } from 'react'
import './Game.css'
import {
  useWebSocketContext,
  WebSocketContextProvider,
} from './WebsocketContext'
import { Room } from './Room'
import { useRoomContext } from './RoomContext'

interface Props {
  hardMode?: boolean
}

export const GameContainer: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <WebSocketContextProvider>
      <Setup />
    </WebSocketContextProvider>
  )
}

export const Setup: React.FC<Props> = ({ hardMode }) => {
  const { socket } = useWebSocketContext()
  const { roomId, playerName, createRoom, joinRoom, setPlayerName } =
    useRoomContext()

  if (!socket) {
    return <div>Loading...</div>
  }

  if (!roomId) {
    return (
      <>
        <div className='create-room-container'>
          <input id='room-name' name='room-name' type='text' />
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
          <input id='room-id' name='room-id' type='text' />
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
        <input id='player-name' name='player-name' type='text' />
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

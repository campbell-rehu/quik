import React, { useEffect, useRef } from 'react'
import './Game.css'
import {
  useWebSocketContext,
  WebSocketContextProvider,
} from '../components/WebsocketContext'
import { Room } from './Room'
import { useRoomContext } from '../components/RoomContext'
import { Routes } from '../types'
import { InputField } from '../components/InputField'
import { useNavigationContext } from '../components/NavigationContext'

interface Props {
  hardMode?: boolean
}

export const GameContainer: React.FC<{}> = () => {
  const { setShowNavBar, setNavItems } = useNavigationContext()
  useEffect(() => {
    setShowNavBar(true)
    setNavItems(
      <a className='navbar-item' href={Routes.HowToPlay}>
        How To Play
      </a>
    )
  }, [setNavItems, setShowNavBar])

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
        <InputField
          inputProps={{
            id: 'room-name',
            name: 'room-name',
            placeholder: 'Enter a room name',
          }}
          inputRef={createRoomInput}
          buttonLabel='Create a new game room'
          onClick={() => {
            var input = document.querySelector('#room-name') as HTMLInputElement
            createRoom(input.value)
          }}
        />
        <InputField
          inputProps={{
            id: 'room-id',
            name: 'room-id',
            placeholder: 'Enter a game room Id',
          }}
          inputRef={joinRoomInput}
          buttonLabel='Join an existing room'
          onClick={() => {
            var input = document.querySelector('#room-id') as HTMLInputElement
            joinRoom(input.value)
          }}
        />
      </>
    )
  }

  if (!playerName) {
    return (
      <InputField
        inputProps={{
          id: 'player-name',
          name: 'player-name',
          placeholder: 'Enter your player name',
          defaultValue: '',
        }}
        inputRef={setPlayerNameInput}
        buttonLabel='Set Player Name'
        onClick={() => {
          var input = document.querySelector('#player-name') as HTMLInputElement
          setPlayerName(roomId, socket.id, input.value)
        }}
      />
    )
  }

  return <Room roomId={roomId} socket={socket} />
}

import React, { PropsWithChildren, useState } from 'react'
import { Socket } from 'socket.io-client'
import { SERVER_URL } from '../config'
import { SocketEventType } from '../constants'

type Value = {
  roomId: string
  createRoom: (roomName: string) => void
  joinRoom: (roomId: string) => void
  playerName: string
  setPlayerName: (roomId: string, playerId: string, playerName: string) => void
}

const defaultValue: Value = {
  roomId: '',
  createRoom: () => {},
  joinRoom: () => {},
  playerName: '',
  setPlayerName: () => {},
}

const RoomContext = React.createContext<Value>(defaultValue)

export const useRoomContext = () => React.useContext(RoomContext)

interface Props {
  socket: Socket
}

export const RoomContextProvider: React.FC<Props & PropsWithChildren> = ({
  socket,
  children,
}) => {
  const [roomId, setRoomId] = useState<string>('')
  const [playerName, setPlayerNameLocal] = useState<string>('')

  const createRoom = async (roomName: string) => {
    const response = await fetch(`${SERVER_URL}/room`, {
      method: 'POST',
      body: JSON.stringify({ roomName }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const json = await response.json()
    setRoomId(json.id)
  }

  const joinRoom = async (roomId: string) => {
    const response = await fetch(`${SERVER_URL}/room/${roomId}`, {
      method: 'GET',
    })
    const json = await response.json()
    setRoomId(json.id)
  }

  const setPlayerName = async (
    roomId: string,
    playerId: string,
    playerName: string
  ) => {
    const response = await fetch(`${SERVER_URL}/player/${playerId}/name`, {
      method: 'POST',
      body: JSON.stringify({ roomId, playerName }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const json = await response.json()
    setPlayerNameLocal(json.playerName)
    socket.emit(SocketEventType.JoinRoom, roomId)
  }

  const value: Value = {
    roomId,
    createRoom,
    joinRoom,
    playerName,
    setPlayerName,
  }

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>
}

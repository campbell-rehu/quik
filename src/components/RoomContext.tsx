import React, { PropsWithChildren, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Socket } from 'socket.io-client'
import { SERVER_URL } from '../config'
import { SocketEventType } from '../constants'

type Value = {
  createRoom: () => void
  joinRoom: (roomId: string) => void
  playerName: string
  setPlayerName: (roomId: string, playerId: string, playerName: string) => void
}

const defaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

const defaultValue: Value = {
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
  const [playerName, setPlayerNameLocal] = useState<string>('')
  const navigate = useNavigate()

  const parseResponse = async (response: Response) => {
    const json = await response.json()
    return JSON.parse(json)
  }

  const createRoom = async () => {
    const response = await fetch(`${SERVER_URL}/room`, {
      method: 'POST',
      headers: defaultHeaders,
    })

    const room = await parseResponse(response)

    navigate(`/game/${room.id}`)
  }

  const joinRoom = async (roomId: string) => {
    const response = await fetch(`${SERVER_URL}/room/${roomId}`, {
      method: 'GET',
      headers: defaultHeaders,
    })
    const room = await parseResponse(response)
    navigate(`/game/${room.id}`)
  }

  const setPlayerName = async (
    roomId: string,
    playerId: string,
    playerName: string
  ) => {
    const response = await fetch(`${SERVER_URL}/room/${roomId}/addPlayer`, {
      method: 'POST',
      body: JSON.stringify({ playerId, playerName }),
      headers: defaultHeaders,
    })
    const player = await parseResponse(response)
    setPlayerNameLocal(player.playerName)
    socket.emit(SocketEventType.JoinRoom, roomId)
  }

  const value: Value = {
    createRoom,
    joinRoom,
    playerName,
    setPlayerName,
  }

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>
}

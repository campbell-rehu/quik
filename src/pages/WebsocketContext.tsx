import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react'
import { io, Socket } from 'socket.io-client'
import { SERVER_URL } from './config'
import { SocketEventType } from './constants'
import { BooleanMap } from './types'

type Value = {
  socket: Socket | null
  roomId: string
  createRoom: (roomName: string) => void
  joinRoom: (roomId: string) => void
  usedLetters: BooleanMap
}

const defaultValue: Value = {
  socket: null,
  roomId: '',
  createRoom: () => {},
  joinRoom: () => {},
  usedLetters: {},
}

const WebSocketContext = createContext<Value>(defaultValue)

export const useWebSocketContext = () => useContext(WebSocketContext)

export const WebSocketContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [roomId, setRoomId] = useState<string>('')
  const [usedLetters, setUsedLetters] = useState<BooleanMap>({})
  const [socket, setSocket] = useState<Socket | null>(null)
  let ws = defaultValue

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
    setUsedLetters(json.usedLetters)
    socket?.emit(SocketEventType.JoinRoom, json.id)
  }

  const joinRoom = async (roomId: string) => {
    const response = await fetch(`${SERVER_URL}/room/${roomId}`, {
      method: 'GET',
    })
    const json = await response.json()
    setRoomId(json.id)
    setUsedLetters(json.usedLetters)
    socket?.emit(SocketEventType.JoinRoom, json.id)
  }

  useEffect(() => {
    const newSocket = io(SERVER_URL)
    setSocket(newSocket)
    return () => {
      newSocket.close()
    }
  }, [setSocket])

  ws = {
    socket,
    roomId,
    createRoom,
    joinRoom,
    usedLetters,
  }

  return (
    <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>
  )
}

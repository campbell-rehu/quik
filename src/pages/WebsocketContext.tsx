import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react'
import { io, Socket } from 'socket.io-client'
import { SERVER_URL } from './config'
import { RoomContextProvider } from './RoomContext'

type Value = {
  socket: Socket | null
}

const defaultValue: Value = {
  socket: null,
}

const WebSocketContext = createContext<Value>(defaultValue)

export const useWebSocketContext = () => useContext(WebSocketContext)

export const WebSocketContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const newSocket = io(SERVER_URL)
    setSocket(newSocket)
    return () => {
      newSocket.close()
    }
  }, [setSocket])

  const ws = {
    socket,
  }

  return (
    <WebSocketContext.Provider value={ws}>
      <RoomContextProvider socket={socket}>{children}</RoomContextProvider>
    </WebSocketContext.Provider>
  )
}

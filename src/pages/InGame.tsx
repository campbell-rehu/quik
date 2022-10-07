import React, { PropsWithChildren } from 'react'
import { BooleanMap } from './types'
import './InGame.css'
import { LettersEasy, LettersHard, SocketEventType } from './constants'
import { useEffect } from 'react'
import { useState } from 'react'
import { StringArrayToBooleanMap } from './helpers'
import {
  useWebSocketContext,
  WebSocketContextProvider,
} from './WebsocketContext'
import { Room } from './Room'
import { useRoomContext } from './RoomContext'

interface Props {
  hardMode?: boolean
}

export const InGameContainer: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <WebSocketContextProvider>
      <InGame />
    </WebSocketContextProvider>
  )
}

export const InGame: React.FC<Props> = ({ hardMode }) => {
  const { socket } = useWebSocketContext()
  const { roomId, createRoom, joinRoom } = useRoomContext()

  const [usedLetters, setUsedLetters] = useState<BooleanMap>({})
  const [letterSet, setLetterSet] = useState<BooleanMap>(
    StringArrayToBooleanMap(Object.values(LettersEasy))
  )
  const [resetTimer, setResetTimer] = useState<boolean>(false)
  const [currentPlayer, setCurrentPlayer] = useState<string>('')
  const toggleSelectLetter = (letter: string) => {
    if (letterSet[letter]) {
      socket?.emit(
        SocketEventType.SelectLetter,
        JSON.stringify({ roomId, letter })
      )
    }
  }

  const endTurn = () => {
    setResetTimer(true)
    socket?.emit(
      SocketEventType.EndTurn,
      JSON.stringify({ roomId, player: socket.id })
    )
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    var key = e.key
    toggleSelectLetter(key.toLocaleUpperCase())
    if (key === ' ') {
      endTurn()
    }
  }

  useEffect(() => {
    socket?.on(SocketEventType.LetterSelected, (usedLetters) => {
      setUsedLetters(usedLetters)
    })
    socket?.on(SocketEventType.RoomJoined, ({ usedLetters, currentPlayer }) => {
      setUsedLetters(usedLetters)
      setCurrentPlayer(currentPlayer)
    })
    socket?.on(SocketEventType.StartTurn, (currentPlayer) => {
      setCurrentPlayer(currentPlayer)
    })
    return () => {
      socket?.off(SocketEventType.LetterSelected)
      socket?.off(SocketEventType.RoomJoined)
    }
  }, [socket])

  useEffect(() => setResetTimer(false), [resetTimer])

  useEffect(() => {
    if (hardMode) {
      setLetterSet(StringArrayToBooleanMap(Object.values(LettersHard)))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hardMode])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, roomId])

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

  return (
    <Room
      roomId={roomId}
      resetTimer={resetTimer}
      letterSet={letterSet}
      usedLetters={usedLetters}
      toggleSelectLetter={toggleSelectLetter}
      endTurn={endTurn}
      currentPlayer={currentPlayer}
    />
  )
}

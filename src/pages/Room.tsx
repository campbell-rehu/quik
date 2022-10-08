import React, { MouseEvent, useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import { Button } from './Button'
import { LettersEasy, SocketEventType, LettersHard } from './constants'
import { StringArrayToBooleanMap } from './helpers'
import { Letter } from './Letter'
import { Timer } from './Timer'
import { BooleanMap, Page, Player } from './types'

interface Props {
  roomId: string
  socket: Socket
  hardMode?: boolean
}

export const Room: React.FC<Props> = ({ roomId, socket, hardMode = false }) => {
  const [usedLetters, setUsedLetters] = useState<BooleanMap>({})
  const [letterSet, setLetterSet] = useState<BooleanMap>(
    StringArrayToBooleanMap(Object.values(LettersEasy))
  )
  const [resetTimer, setResetTimer] = useState<boolean>(false)
  const [currentPlayer, setCurrentPlayer] = useState<Player>({
    id: socket.id,
    name: 'Player',
    isTurn: false,
  })
  const [selectedLetter, setSelectedLetter] = useState<string>('')
  const isThisCurrentPlayer = () => socket.id === currentPlayer.id

  const toggleSelectLetter = (letter: string) => {
    if (isThisCurrentPlayer()) {
      if (letterSet[letter]) {
        setSelectedLetter(letter)
        socket.emit(
          SocketEventType.SelectLetter,
          JSON.stringify({ roomId, letter })
        )
      }
    }
  }

  const endTurn = () => {
    if (isThisCurrentPlayer()) {
      setResetTimer(true)
      socket.emit(
        SocketEventType.EndTurn,
        JSON.stringify({ roomId, selectedLetter })
      )
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    var key = e.key
    toggleSelectLetter(key.toLocaleUpperCase())
    if (key === 'Enter') {
      endTurn()
    }
  }

  useEffect(() => {
    socket.on(SocketEventType.LetterSelected, (usedLetters) => {
      setUsedLetters(usedLetters)
    })
    socket.on(SocketEventType.RoomJoined, ({ usedLetters, currentPlayer }) => {
      setUsedLetters(usedLetters)
      setCurrentPlayer(currentPlayer)
    })
    socket.on(SocketEventType.StartTurn, (currentPlayer) => {
      setCurrentPlayer(currentPlayer)
    })
    return () => {
      socket.off(SocketEventType.LetterSelected)
      socket.off(SocketEventType.RoomJoined)
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

  const handleLeaveRoom = (e: MouseEvent) => {
    socket.emit(
      SocketEventType.LeaveRoom,
      JSON.stringify({ roomId, playerId: socket.id })
    )
  }

  const isLetterSeletable = (letter: string) => {
    return letter in usedLetters && usedLetters[letter] === true
  }

  const isLetterUsed = (letter: string) => {
    return letter in usedLetters
  }

  const canSelectLetter = (letter: string) => {
    return isLetterSeletable(letter) || !isLetterUsed(letter)
  }

  return (
    <section>
      <Button to={Page.Lobby} label='Leave Room' onClick={handleLeaveRoom} />
      <h1>Game room: {roomId}</h1>
      <Timer reset={resetTimer} />
      <div className='letters-container'>
        {Object.keys(letterSet).map((letter) => (
          <Letter
            key={letter}
            label={letter}
            used={letter in usedLetters}
            canSelect={canSelectLetter(letter)}
            toggleSelectLetter={toggleSelectLetter}
          />
        ))}
      </div>
      <div className='topic-container'>Children's songs</div>
      <div className='turn-container'>{currentPlayer.name}'s turn</div>
      <button onClick={endTurn}>End Turn</button>
    </section>
  )
}

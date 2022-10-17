import React, {
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Socket } from 'socket.io-client'
import { LettersEasy, SocketEventType, LettersHard } from '../constants'
import { StringArrayToBooleanMap } from '../helpers'
import { Letter } from '../components/Letter'
import { Timer } from '../components/Timer'
import { BooleanMap, Player, Routes } from '../types'
import { useNavigationContext } from '../components/NavigationContext'

interface Props {
  roomId: string
  socket: Socket
  hardMode?: boolean
}

export const Room: React.FC<Props> = ({ roomId, socket, hardMode = false }) => {
  const { setShowNavBar, setNavItems } = useNavigationContext()
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
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [isInTextMode, setIsInTextMode] = useState<boolean>(false)
  const sectionRef = useRef<HTMLElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isThisCurrentPlayer = () => socket.id === currentPlayer.id

  const canSelectLetter = (letter: string) =>
    isLetterSeletable(letter) || !isLetterUsed(letter)

  const isLetterSeletable = (letter: string) =>
    letter in usedLetters && usedLetters[letter] === true

  const isLetterUsed = (letter: string) => letter in usedLetters

  const isLetterInLetterSet = (letter: string) => letter in letterSet

  const toggleSelectLetter = (letter: string) => {
    if (
      !canSelectLetter(letter) ||
      !isThisCurrentPlayer() ||
      !isLetterInLetterSet(letter)
    ) {
      return
    }
    let prevLetter = ''
    if (selectedLetter !== letter) {
      prevLetter = selectedLetter
    }
    setSelectedLetter((prev) => (prev === letter ? '' : letter))
    socket.emit(
      SocketEventType.SelectLetter,
      JSON.stringify({ roomId, letter, prevLetter })
    )
  }

  const endTurn = () => {
    if (socket.id === currentPlayer.id) {
      if (selectedLetter !== '') {
        setResetTimer(true)
        setSelectedLetter('')
        socket.emit(
          SocketEventType.EndTurn,
          JSON.stringify({ roomId, selectedLetter })
        )
        inputRef.current!.value = ''
      }
    }
  }

  const handleTextMode = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!gameStarted) return
    const value = e.target.value
    if (Boolean(value)) {
      if (selectedLetter === '') {
        const keyUpper = value!.charAt(0).toUpperCase()
        toggleSelectLetter(keyUpper)
      }
    } else {
      if (selectedLetter !== '') {
        toggleSelectLetter(selectedLetter)
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!gameStarted) return
    var key = e.key
    if (key === 'Enter') {
      endTurn()
    } else {
      if (!isInTextMode) {
        const keyUpper = key.toUpperCase()
        toggleSelectLetter(keyUpper)
      }
    }
  }

  const handleLeaveRoom = (e: MouseEvent) => {
    socket.emit(
      SocketEventType.LeaveRoom,
      JSON.stringify({ roomId, playerId: socket.id })
    )
  }

  const handleStartGame = () => {
    setGameStarted(true)
    if (isInTextMode) {
      // if we're in text mode focus on the input
      inputRef.current?.focus()
    }
    socket?.emit('countdown-started', JSON.stringify({ roomId }))
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

  useEffect(() => sectionRef.current?.focus(), [sectionRef])

  useEffect(() => {
    if (hardMode) {
      setLetterSet(StringArrayToBooleanMap(Object.values(LettersHard)))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hardMode])

  useEffect(() => {
    setShowNavBar(true)
    setNavItems(
      <a
        className='navbar-item'
        href={Routes.HowToPlay}
        onClick={handleLeaveRoom}>
        Leave Room
      </a>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setShowNavBar, setNavItems])

  return (
    <section
      className='section room'
      ref={sectionRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}>
      <div className='container'>
        <h1 className='title has-text-centered'>Game room: {roomId}</h1>
        <Timer
          reset={resetTimer}
          gameStarted={gameStarted}
          setGameStarted={handleStartGame}
          currentPlayer={currentPlayer}
          isCurrentPlayer={isThisCurrentPlayer()}
        />
        {!gameStarted ? (
          <div className='buttons is-centered'>
            <button
              className='button is-primary'
              onClick={() => {
                setIsInTextMode(!isInTextMode)
              }}>
              {!isInTextMode ? 'Enable' : 'Disable'} text mode
            </button>
          </div>
        ) : null}

        <div className='container letters-container has-text-centered mb-4'>
          {Object.keys(letterSet).map((letter) => (
            <Letter
              key={letter}
              label={letter}
              used={letter in usedLetters}
              toggleSelectLetter={(letter: string) => {
                if (!isInTextMode && gameStarted) {
                  toggleSelectLetter(letter)
                }
              }}
            />
          ))}
        </div>
        <div className='container has-text-centered'>
          <div className='block'>
            <div className='turn-container subtitle is-4'>Topic</div>
            <div className='topic-container title is-2'>Children's songs</div>
          </div>
          <div className='block'>
            <div className='turn-container subtitle is-4'>Turn</div>
            <div className='topic-container title is-2'>
              {currentPlayer.name}'s turn
            </div>
          </div>
          {isInTextMode ? (
            <div className='buttons is-centered'>
              <div className='control'>
                <input
                  id='text-mode-input'
                  name='text-mode-input'
                  placeholder='Enter your answer'
                  onInput={handleTextMode}
                  disabled={!gameStarted}
                  className='input is-primary'
                  type='text'
                  ref={inputRef}
                />
              </div>
            </div>
          ) : (
            <button className='button is-primary' onClick={endTurn}>
              End Turn
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

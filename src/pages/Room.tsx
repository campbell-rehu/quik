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
  const sectionRef = useRef<HTMLElement>(null)

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
      setResetTimer(true)
      setSelectedLetter('')
      socket.emit(
        SocketEventType.EndTurn,
        JSON.stringify({ roomId, selectedLetter })
      )
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    var key = e.key
    if (key === 'Enter') {
      endTurn()
    } else {
      var keyUpper = key.toUpperCase()
      toggleSelectLetter(keyUpper)
    }
  }

  const handleLeaveRoom = (e: MouseEvent) => {
    socket.emit(
      SocketEventType.LeaveRoom,
      JSON.stringify({ roomId, playerId: socket.id })
    )
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
        <Timer reset={resetTimer} />
        <div className='container letters-container has-text-centered mb-4'>
          {Object.keys(letterSet).map((letter) => (
            <Letter
              key={letter}
              label={letter}
              used={letter in usedLetters}
              toggleSelectLetter={toggleSelectLetter}
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
          <button className='button is-primary' onClick={endTurn}>
            End Turn
          </button>
        </div>
      </div>
    </section>
  )
}

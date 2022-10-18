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
  currentPlayer: Player
  roomHasEnoughPlayers: boolean
  hardMode?: boolean
}

export const Room: React.FC<Props> = ({
  roomId,
  socket,
  currentPlayer: currentPlayerInit,
  roomHasEnoughPlayers: roomHasEnoughPlayersInit,
  hardMode = false,
}) => {
  const { setShowNavBar, setNavItems } = useNavigationContext()
  const [usedLetters, setUsedLetters] = useState<BooleanMap>({})
  const [letterSet, setLetterSet] = useState<BooleanMap>(
    StringArrayToBooleanMap(Object.values(LettersEasy))
  )
  const [resetTimer, setResetTimer] = useState<boolean>(false)
  const [currentPlayer, setCurrentPlayer] = useState<Player>(currentPlayerInit)
  const [selectedLetter, setSelectedLetter] = useState<string>('')
  const [roundStarted, setRoundStarted] = useState<boolean>(false)
  const [isInTextMode, setIsInTextMode] = useState<boolean>(false)
  const [textModeWords, setTextModeWords] = useState<string[]>([])
  const [roundWinner, setRoundWinner] = useState<Player | null>(null)
  const [gameWinner, setGameWinner] = useState<Player | null>(null)
  const [roomHasEnoughPlayers, setRoomHasEnoughPlayers] = useState<boolean>(
    roomHasEnoughPlayersInit
  )
  const [category, setCategory] = useState<string>('')
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
        let textModeWord = ''
        if (isInTextMode) {
          textModeWord = inputRef.current!.value
          inputRef.current!.value = ''
        }
        socket.emit(
          SocketEventType.EndTurn,
          JSON.stringify({ roomId, selectedLetter, textModeWord })
        )
      }
    }
  }

  const handleTextMode = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!roundStarted) return
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
    if (!roundStarted) return
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
    setRoundStarted(true)
    if (isInTextMode) {
      // if we're in text mode focus on the input
      inputRef.current?.focus()
    }
    socket.emit(SocketEventType.CountdownStarted, JSON.stringify({ roomId }))
  }

  const handleSetIsTextMode = () => {
    socket.emit(
      SocketEventType.SetIsInTextMode,
      JSON.stringify({ isInTextMode: !isInTextMode, roomId })
    )
  }

  const handlePlayAgain = () => {
    socket.emit(SocketEventType.CountdownStarted, JSON.stringify({ roomId }))
  }

  useEffect(() => {
    socket.on(SocketEventType.LetterSelected, (usedLetters) => {
      setUsedLetters(usedLetters)
    })
    socket.on(
      SocketEventType.RoomJoined,
      ({ usedLetters, currentPlayer, playerCount }) => {
        setUsedLetters(usedLetters)
        setCurrentPlayer(currentPlayer)
        setRoomHasEnoughPlayers(playerCount > 1)
      }
    )
    socket.on(SocketEventType.StartTurn, ({ textModeWords, currentPlayer }) => {
      setCurrentPlayer(currentPlayer)
      setTextModeWords(textModeWords)
    })
    socket.on(
      SocketEventType.RoundStarted,
      ({ category, usedLetters, currentPlayer }) => {
        setGameWinner(null)
        setRoundWinner(null)
        setCategory(category)
        setRoundStarted(true)
        setUsedLetters(usedLetters)
        setCurrentPlayer(currentPlayer)
      }
    )
    socket.on(SocketEventType.SetIsInTextMode, ({ isInTextMode }) => {
      setIsInTextMode(isInTextMode)
    })
    socket.on(SocketEventType.RoundEnded, ({ winningPlayer }) => {
      setRoundStarted(false)
      setRoundWinner(winningPlayer)
    })
    socket.on(
      SocketEventType.GameEnded,
      ({ gameWinner, usedLetters, currentPlayer, playerCount }) => {
        setGameWinner(gameWinner)
        setRoundWinner(null)
        setUsedLetters(usedLetters)
        setCurrentPlayer(currentPlayer)
        setRoomHasEnoughPlayers(playerCount > 1)
      }
    )
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

  useEffect(() => setCurrentPlayer(currentPlayerInit), [currentPlayerInit])
  useEffect(
    () => setRoomHasEnoughPlayers(roomHasEnoughPlayersInit),
    [roomHasEnoughPlayersInit]
  )

  return (
    <section
      className='section room'
      ref={sectionRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}>
      {gameWinner ? (
        <div className='container'>
          <p className='title is-2 has-text-centered'>
            {gameWinner.name} won the game!
          </p>
          <div className='buttons is-centered'>
            <button className='button is-primary' onClick={handlePlayAgain}>
              Play again
            </button>
          </div>
        </div>
      ) : (
        <div className='container'>
          <h1 className='title has-text-centered'>Game room: {roomId}</h1>
          {roundWinner ? (
            <>
              <div className='container is-centered'>
                <p className='title is-2 has-text-centered'>
                  {roundWinner.name} won the round!
                </p>
                <div className='buttons is-centered'>
                  <button
                    className='button is-primary'
                    onClick={() => {
                      handleStartGame()
                      // Reset focus on the section for keydown listener
                      const roomSection = document
                        .getElementsByClassName('room')
                        .item(0) as HTMLElement
                      roomSection.focus()
                    }}>
                    Start next round
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {!roundStarted ? (
                <div className='container block'>
                  <div className='buttons is-centered'>
                    <button
                      className='button is-primary'
                      disabled={!roomHasEnoughPlayers}
                      onClick={() => {
                        handleStartGame()
                        // Reset focus on the section for keydown listener
                        const roomSection = document
                          .getElementsByClassName('room')
                          .item(0) as HTMLElement
                        roomSection.focus()
                      }}>
                      {!roomHasEnoughPlayers
                        ? 'Waiting for more players to join...'
                        : 'Start round'}
                    </button>
                  </div>
                  <div className='buttons is-centered'>
                    <button
                      className='button is-primary'
                      onClick={handleSetIsTextMode}>
                      {!isInTextMode ? 'Enable' : 'Disable'} text mode
                    </button>
                  </div>
                </div>
              ) : (
                <Timer
                  reset={resetTimer}
                  currentPlayer={currentPlayer}
                  isCurrentPlayer={isThisCurrentPlayer()}
                />
              )}
              {isInTextMode ? (
                <div className='buttons is-centered'>
                  <div className='control'>
                    <input
                      id='text-mode-input'
                      name='text-mode-input'
                      placeholder='Enter your answer'
                      onInput={handleTextMode}
                      disabled={!roundStarted}
                      className='input is-primary'
                      type='text'
                      ref={inputRef}
                    />
                  </div>
                </div>
              ) : (
                roundStarted && (
                  <div className='buttons is-centered'>
                    <button className='button is-primary' onClick={endTurn}>
                      End Turn
                    </button>
                  </div>
                )
              )}
            </>
          )}

          <div className='container letters-container has-text-centered mb-4'>
            {Object.keys(letterSet).map((letter) => (
              <Letter
                key={letter}
                label={letter}
                used={letter in usedLetters}
                toggleSelectLetter={(letter: string) => {
                  if (!isInTextMode && roundStarted) {
                    toggleSelectLetter(letter)
                  }
                }}
              />
            ))}
          </div>
          <div className='container has-text-centered'>
            <div className='block'>
              <div className='turn-container subtitle is-4'>Category</div>
              <div className='topic-container title is-2'>
                {category ? category : '-'}
              </div>
            </div>
            <div className='block'>
              <div className='turn-container subtitle is-4'>Turn</div>
              <div className='topic-container title is-2'>
                {isThisCurrentPlayer() ? 'Your' : `${currentPlayer.name}'s`}{' '}
                turn
              </div>
            </div>
            {/* TODO: imrove the UI for displaying the text mode answers */}
            {isInTextMode ? (
              <div className='block content'>
                <p className='title is-3'>Answers</p>
                <ul>
                  {textModeWords.map((word) => (
                    <li key={word}>{word}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  )
}

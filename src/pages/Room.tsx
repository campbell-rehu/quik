/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Socket } from 'socket.io-client'
import { LettersEasy, SocketEventType, LettersHard } from '../constants'
import { StringArrayToBooleanMap } from '../helpers'
import { Letter } from '../components/Letter'
import { Timer } from '../components/Timer'
import { BooleanMap, Player, PlayersById, Routes } from '../types'
import { useNavigationContext } from '../components/NavigationContext'
import classNames from 'classnames'
import { ArrowLeftIcon } from '@sanity/icons'
import { useSocketEvents } from '../hooks/useSocketEvents'
import { useLetterGrid } from '../hooks/useLetterGrid'
import { Button } from '../components/Button'

interface Props {
  roomId: string
  socket: Socket
  currentPlayer: Player
  players: PlayersById
  setPlayers: (p: PlayersById) => void
  roomHasEnoughPlayers: boolean
  hardMode?: boolean
}

export const Room: React.FC<Props> = ({
  roomId,
  socket,
  currentPlayer: currentPlayerInit,
  players,
  setPlayers,
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
  const [roundWinner, setRoundWinner] = useState<Player | null>(null)
  const [gameWinner, setGameWinner] = useState<Player | null>(null)
  const [roomHasEnoughPlayers, setRoomHasEnoughPlayers] = useState<boolean>(
    roomHasEnoughPlayersInit
  )
  const [category, setCategory] = useState<string>('')
  const sectionRef = useRef<HTMLElement>(null)

  const isThisCurrentPlayer = useCallback(
    () => socket.id === currentPlayer.id,
    [socket.id, currentPlayer.id]
  )

  const isPlayersTurn = useCallback(
    (id: string) => id === currentPlayer.id,
    [currentPlayer.id]
  )

  const canSelectLetter = useCallback(
    (letter: string) => isLetterSelectable(letter) || !isLetterUsed(letter),
    []
  )

  const isLetterSelectable = useCallback(
    (letter: string) => letter in usedLetters && usedLetters[letter] === true,
    [usedLetters]
  )

  const isLetterUsed = useCallback(
    (letter: string) => letter in usedLetters,
    [usedLetters]
  )

  const isLetterInLetterSet = useCallback(
    (letter: string) => letter in letterSet,
    [letterSet]
  )

  const {
    selectLetter,
    endTurn: socketEndTurn,
    leaveRoom,
    startGame,
    playAgain,
  } = useSocketEvents({
    socket,
    roomId,
    onLetterSelected: setUsedLetters,
    onRoomJoined: (data) => {
      setUsedLetters(data.usedLetters)
      setCurrentPlayer(data.currentPlayer)
      setRoomHasEnoughPlayers(data.playerCount > 1)
      setPlayers(data.players)
    },
    onStartTurn: (data) => {
      setUsedLetters(data.usedLetters)
      setCurrentPlayer(data.currentPlayer)
    },
    onRoundStarted: (data) => {
      setGameWinner(null)
      setRoundWinner(null)
      setCategory(data.category)
      setRoundStarted(true)
      setUsedLetters(data.usedLetters)
      setCurrentPlayer(data.currentPlayer)
    },
    onRoundEnded: (data) => {
      setRoundStarted(false)
      setRoundWinner(data.winningPlayer)
    },
    onGameEnded: (data) => {
      setGameWinner(data.gameWinner)
      setRoundWinner(null)
      setUsedLetters(data.usedLetters)
      setCurrentPlayer(data.currentPlayer)
      setRoomHasEnoughPlayers(data.playerCount > 1)
    },
    onPlayerEliminated: (data) => {
      setUsedLetters(data.usedLetters)
      setCurrentPlayer(data.currentPlayer)
      setRoomHasEnoughPlayers(data.playerCount > 1)
      setPlayers(data.players)
    },
  })

  const toggleSelectLetter = useCallback(
    (letter: string) => {
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
      selectLetter(letter, prevLetter)
    },
    [
      canSelectLetter,
      isThisCurrentPlayer,
      isLetterInLetterSet,
      selectedLetter,
      selectLetter,
    ]
  )

  const handleEndTurn = useCallback(() => {
    if (socket.id === currentPlayer.id) {
      if (selectedLetter !== '' && canSelectLetter(selectedLetter)) {
        socketEndTurn(selectedLetter)
        setResetTimer(true)
        setSelectedLetter('')
      }
    }
  }, [
    socket.id,
    currentPlayer.id,
    selectedLetter,
    canSelectLetter,
    socketEndTurn,
  ])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!roomHasEnoughPlayers) {
        return
      }
      if (!roundStarted && !gameWinner) {
        startGame()
      }
      var key = e.key
      if (key === 'Enter') {
        handleEndTurn()
      } else {
        const keyUpper = key.toUpperCase()
        toggleSelectLetter(keyUpper)
      }
    },
    [
      roomHasEnoughPlayers,
      roundStarted,
      gameWinner,
      handleEndTurn,
      toggleSelectLetter,
      startGame,
    ]
  )

  useEffect(() => setResetTimer(false), [resetTimer])

  useEffect(() => sectionRef.current?.focus(), [sectionRef])

  useEffect(() => {
    if (hardMode) {
      setLetterSet(StringArrayToBooleanMap(Object.values(LettersHard)))
    }
  }, [hardMode])

  useEffect(() => {
    setShowNavBar(true)
    setNavItems(
      <a className='navbar-item' href={Routes.HowToPlay} onClick={leaveRoom}>
        Leave Room
      </a>
    )
  }, [setShowNavBar, setNavItems, leaveRoom])

  useEffect(() => setCurrentPlayer(currentPlayerInit), [currentPlayerInit])
  useEffect(
    () => setRoomHasEnoughPlayers(roomHasEnoughPlayersInit),
    [roomHasEnoughPlayersInit]
  )

  const playerList = useMemo(
    () => (
      <div className='box mr4'>
        <div className='has-text-weight-bold is-size-4'>Players</div>
        {Object.keys(players).map((playerId) => (
          <div
            key={playerId}
            className={classNames({
              'has-text-primary': isPlayersTurn(playerId),
            })}>
            {players[playerId].name}
            {isPlayersTurn(playerId) && (
              <ArrowLeftIcon
                className='ml4'
                style={{ verticalAlign: 'middle' }}
              />
            )}{' '}
          </div>
        ))}
      </div>
    ),
    [players, isPlayersTurn]
  )

  const letterGrid = useLetterGrid({
    letterSet,
    usedLetters,
    roundStarted,
    onLetterSelect: toggleSelectLetter,
  })

  return (
    <div className='game-container'>
      <div className='game-header'>
        <div className='room-info'>
          <h2 className='title is-4'>Room: {roomId}</h2>
          <div className='game-mode'>
            {hardMode ? 'Hard Mode' : 'Easy Mode'}
          </div>
        </div>
        <Timer
          reset={resetTimer}
          currentPlayer={currentPlayer}
          isCurrentPlayer={isThisCurrentPlayer()}
        />
      </div>

      <div className='game-content'>
        <div className='game-main'>
          {gameWinner ? (
            <div className='game-status winner'>
              <h3 className='title is-3'>Game Over!</h3>
              <p className='subtitle'>{gameWinner.name} wins the game!</p>
              <Button
                label='Play Again'
                onClick={playAgain}
                classes='button is-primary is-large'
              />
            </div>
          ) : roundWinner ? (
            <div className='game-status'>
              <h3 className='title is-3'>Round Over!</h3>
              <p className='subtitle'>{roundWinner.name} wins the round!</p>
              <Button
                label='Next Round'
                onClick={startGame}
                classes='button is-primary is-large'
              />
            </div>
          ) : (
            <>
              {category && (
                <div className='category-container'>
                  <h3 className='title is-3'>{category}</h3>
                </div>
              )}
              {letterGrid}
              <div className='game-controls'>
                <Button
                  label='End Turn'
                  onClick={handleEndTurn}
                  classes={classNames('button is-primary', {
                    'is-loading': !isThisCurrentPlayer(),
                  })}
                  disabled={!isThisCurrentPlayer()}
                />
              </div>
            </>
          )}
        </div>

        <div className='game-sidebar'>
          <div className='player-list'>
            <h3 className='title is-4'>Players</h3>
            {Object.entries(players).map(([id, player]) => (
              <div
                key={id}
                className={classNames('player-item', {
                  'is-current': isPlayersTurn(id),
                  'is-eliminated': player.eliminated,
                })}>
                <span className='player-name'>{player.name}</span>
                {isPlayersTurn(id) && (
                  <span className='player-turn-indicator'>←</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

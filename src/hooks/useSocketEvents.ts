import { useCallback, useEffect } from 'react'
import { Socket } from 'socket.io-client'
import { SocketEventType } from '../constants'
import { Player, PlayersById } from '../types'

interface UseSocketEventsProps {
  socket: Socket
  roomId: string
  onLetterSelected: (usedLetters: { [key: string]: boolean }) => void
  onRoomJoined: (data: {
    players: PlayersById
    usedLetters: { [key: string]: boolean }
    currentPlayer: Player
    playerCount: number
  }) => void
  onStartTurn: (data: {
    usedLetters: { [key: string]: boolean }
    currentPlayer: Player
  }) => void
  onRoundStarted: (data: {
    category: string
    usedLetters: { [key: string]: boolean }
    currentPlayer: Player
  }) => void
  onRoundEnded: (data: { winningPlayer: Player }) => void
  onGameEnded: (data: {
    gameWinner: Player
    usedLetters: { [key: string]: boolean }
    currentPlayer: Player
    playerCount: number
  }) => void
  onPlayerEliminated: (data: {
    players: PlayersById
    usedLetters: { [key: string]: boolean }
    currentPlayer: Player
    playerCount: number
  }) => void
}

interface SocketActions {
  selectLetter: (letter: string, prevLetter: string) => void
  endTurn: (selectedLetter: string) => void
  leaveRoom: () => void
  startGame: () => void
  playAgain: () => void
}

export const useSocketEvents = ({
  socket,
  roomId,
  onLetterSelected,
  onRoomJoined,
  onStartTurn,
  onRoundStarted,
  onRoundEnded,
  onGameEnded,
  onPlayerEliminated,
}: UseSocketEventsProps): SocketActions => {
  // Socket event handlers
  useEffect(() => {
    const handleLetterSelected = (usedLetters: { [key: string]: boolean }) => {
      onLetterSelected(usedLetters)
    }

    const handleRoomJoined = (data: string) => {
      const parsedData = JSON.parse(data)
      onRoomJoined(parsedData)
    }

    const handleStartTurn = (data: {
      usedLetters: { [key: string]: boolean }
      currentPlayer: Player
    }) => {
      onStartTurn(data)
    }

    const handleRoundStarted = (data: {
      category: string
      usedLetters: { [key: string]: boolean }
      currentPlayer: Player
    }) => {
      onRoundStarted(data)
    }

    const handleRoundEnded = (data: { winningPlayer: Player }) => {
      onRoundEnded(data)
    }

    const handleGameEnded = (data: {
      gameWinner: Player
      usedLetters: { [key: string]: boolean }
      currentPlayer: Player
      playerCount: number
    }) => {
      onGameEnded(data)
    }

    const handlePlayerEliminated = (data: string) => {
      const parsedData = JSON.parse(data)
      onPlayerEliminated(parsedData)
    }

    socket.on(SocketEventType.LetterSelected, handleLetterSelected)
    socket.on(SocketEventType.RoomJoined, handleRoomJoined)
    socket.on(SocketEventType.StartTurn, handleStartTurn)
    socket.on(SocketEventType.RoundStarted, handleRoundStarted)
    socket.on(SocketEventType.RoundEnded, handleRoundEnded)
    socket.on(SocketEventType.GameEnded, handleGameEnded)
    socket.on(SocketEventType.PlayerEliminated, handlePlayerEliminated)

    return () => {
      socket.off(SocketEventType.LetterSelected, handleLetterSelected)
      socket.off(SocketEventType.RoomJoined, handleRoomJoined)
      socket.off(SocketEventType.StartTurn, handleStartTurn)
      socket.off(SocketEventType.RoundStarted, handleRoundStarted)
      socket.off(SocketEventType.RoundEnded, handleRoundEnded)
      socket.off(SocketEventType.GameEnded, handleGameEnded)
      socket.off(SocketEventType.PlayerEliminated, handlePlayerEliminated)
    }
  }, [
    socket,
    roomId,
    onLetterSelected,
    onRoomJoined,
    onStartTurn,
    onRoundStarted,
    onRoundEnded,
    onGameEnded,
    onPlayerEliminated,
  ])

  // Socket action handlers
  const selectLetter = useCallback(
    (letter: string, prevLetter: string) => {
      socket.emit(
        SocketEventType.SelectLetter,
        JSON.stringify({ roomId, letter, prevLetter })
      )
    },
    [socket, roomId]
  )

  const endTurn = useCallback(
    (selectedLetter: string) => {
      socket.emit(
        SocketEventType.EndTurn,
        JSON.stringify({ roomId, selectedLetter })
      )
    },
    [socket, roomId]
  )

  const leaveRoom = useCallback(() => {
    socket.emit(
      SocketEventType.LeaveRoom,
      JSON.stringify({ roomId, playerId: socket.id })
    )
  }, [socket, roomId])

  const startGame = useCallback(() => {
    socket.emit(SocketEventType.CountdownStarted, JSON.stringify({ roomId }))
  }, [socket, roomId])

  const playAgain = useCallback(() => {
    socket.emit(SocketEventType.CountdownStarted, JSON.stringify({ roomId }))
  }, [socket, roomId])

  return {
    selectLetter,
    endTurn,
    leaveRoom,
    startGame,
    playAgain,
  }
}

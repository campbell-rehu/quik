import { v4 } from 'uuid'

export class Rooms {
  private rooms: { [roomId: string]: Room }

  constructor() {
    this.rooms = {}
  }

  getRoom = (roomId: string) => this.rooms[roomId]

  initialiseNewRoom = () => {
    const id = v4()
    this.rooms[id] = new Room(id)
    return this.rooms[id]
  }
}

export class Room {
  private roomId: string
  private players: {
    [playerId: string]: {
      id: string
      name: string
      isTurn: boolean
    }
  }
  private usedLetters: {
    [letter: string]: boolean
  }
  private countdown: {
    started: boolean
    timer: NodeJS.Timer | undefined
    time: number
  }
  private currentPlayerIndex: number

  constructor(roomId: string) {
    this.roomId = roomId
    this.players = {}
    this.usedLetters = {}
    this.countdown = {
      started: false,
      timer: undefined,
      time: 10,
    }
    this.currentPlayerIndex = 0
  }

  getId = () => this.roomId
  getPlayers = () => this.players
  getUsedLetters = () => this.usedLetters
  getCountdown = () => this.countdown
  getCurrentPlayer = () =>
    this.players[Object.keys(this.players)[this.currentPlayerIndex]]

  addPlayer = (
    playerId: string,
    name: string = `${Object.keys(this.players).length + 1}`
  ) => {
    this.players[playerId] = {
      id: playerId,
      name,
      isTurn: false,
    }
  }
  addUsedLetter = (letter: string) => {
    this.usedLetters[letter] = true
    return this.usedLetters
  }
  resetCountdown = () => {
    clearInterval(this.countdown.timer)
    this.countdown = {
      started: false,
      timer: undefined,
      time: 10,
    }
  }
  setNextPlayer = () => {
    const playerIds = Object.keys(this.players)
    const playerPlayingValues = Object.values(this.players)
    let nextPlayerIndex = this.currentPlayerIndex + 1
    if (nextPlayerIndex > playerIds.length - 1) {
      nextPlayerIndex = 0
    }
    let previousPlayerIndex = playerPlayingValues.findIndex((v) => v.isTurn)
    if (previousPlayerIndex >= 0) {
      const previousPlayer = playerIds[previousPlayerIndex]
      this.players[previousPlayer].isTurn = false
    }
    var nextPlayer = playerIds[nextPlayerIndex]
    this.players[nextPlayer].isTurn = true
  }
}

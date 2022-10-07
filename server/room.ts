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
    [playerId: string]: boolean
  }
  private usedLetters: {
    [letter: string]: boolean
  }
  private countdown: {
    timer: NodeJS.Timer | undefined
    time: number
  }

  constructor(roomId: string) {
    this.roomId = roomId
    this.players = {}
    this.usedLetters = {}
    this.countdown = {
      timer: undefined,
      time: 10,
    }
  }

  getId = () => this.roomId
  getPlayers = () => this.players
  getUsedLetters = () => this.usedLetters
  getCountdown = () => this.countdown

  addPlayer = (playerId: string) => (this.players[playerId] = true)
  addUsedLetter = (letter: string) => {
    this.usedLetters[letter] = true
    return this.usedLetters
  }
  resetCountdown = () => {
    clearInterval(this.countdown.timer)
    this.countdown = { timer: undefined, time: 10 }
  }
}

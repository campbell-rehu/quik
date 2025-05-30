export enum Page {
  Splash = 'Splash',
  HowToPlay = 'How to Play',
  Game = 'Game',
}

export enum Routes {
  Splash = '/splash',
  HowToPlay = '/how-to-play',
  Game = '/game',
}

export type BooleanMap = {
  [key: string]: boolean
}

export type Player = {
  id: string
  name: string
  eliminated: boolean
  isTurn: boolean
}

export type PlayersById = {
  [playerId: string]: Player
}

export type RoomData = {
  players: PlayersById
  usedLetters: BooleanMap
  currentPlayer: Player
  playerCount: number
}

export type TurnData = {
  usedLetters: BooleanMap
  currentPlayer: Player
}

export type RoundData = TurnData & {
  category: string
}

export type GameEndData = TurnData & {
  gameWinner: Player
}

export type PlayerEliminatedData = RoomData

export type SocketError = {
  message: string
  code: string
}

export type ApiResponse<T> = {
  data?: T
  error?: SocketError
}

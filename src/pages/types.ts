export enum Page {
  Splash = 'Splash',
  Lobby = 'Lobby',
  Game = 'Game',
}

export enum Routes {
  Splash = '/splash',
  Lobby = '/lobby',
  Game = '/game',
}

export type BooleanMap = {
  [key: string]: boolean
}

export type Player = {
  id: string
  name: string
  isTurn: boolean
}

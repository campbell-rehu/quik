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
  isTurn: boolean
}

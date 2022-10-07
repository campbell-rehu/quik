import { Page, Routes } from './types'

export const PageToRoute = {
  [Page.Splash]: Routes.Splash,
  [Page.Lobby]: Routes.Lobby,
  [Page.InGame]: Routes.InGame,
}

export enum LettersEasy {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
  I = 'I',
  J = 'J',
  K = 'K',
  L = 'L',
  M = 'M',
  N = 'N',
  O = 'O',
  P = 'P',
  R = 'R',
  S = 'S',
  T = 'T',
  W = 'W',
}

export enum LettersHard {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
  I = 'I',
  J = 'J',
  K = 'K',
  L = 'L',
  M = 'M',
  N = 'N',
  O = 'O',
  P = 'P',
  Q = 'Q',
  R = 'R',
  S = 'S',
  T = 'T',
  U = 'U',
  V = 'V',
  W = 'W',
  X = 'X',
  Y = 'Y',
  Z = 'Z',
}

export enum SocketEventType {
  JoinRoom = 'join-room',
  RoomJoined = 'room-joined',
  SelectLetter = 'select-letter',
  LetterSelected = 'letter-selected',
  EndTurn = 'end-turn',
  StartTurn = 'start-turn',
}

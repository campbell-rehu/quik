import React from 'react'
import { Button } from './Button'
import { Letter } from './Letter'
import { Timer } from './Timer'
import { BooleanMap, Page } from './types'

interface Props {
  roomId: string
  resetTimer: boolean
  letterSet: BooleanMap
  usedLetters: BooleanMap
  toggleSelectLetter: (letter: string) => void
  endTurn: () => void
  currentPlayer: string
}

export const Room: React.FC<Props> = ({
  roomId,
  resetTimer,
  letterSet,
  usedLetters,
  toggleSelectLetter,
  endTurn,
  currentPlayer,
}) => {
  return (
    <section>
      <Button to={Page.Lobby} label='Back' />
      <h1>Game room: {roomId}</h1>
      <Timer reset={resetTimer} />
      <div className='letters-container'>
        {Object.keys(letterSet).map((letter) => (
          <Letter
            key={letter}
            label={letter}
            used={Boolean(usedLetters[letter])}
            toggleSelectLetter={toggleSelectLetter}
          />
        ))}
      </div>
      <div className='topic-container'>Harry Potter Characters</div>
      <div className='turn-container'>{currentPlayer}'s turn</div>
      <button onClick={endTurn}>End Turn</button>
    </section>
  )
}

import React, { useCallback, useMemo, ReactElement } from 'react'
import { BooleanMap } from '../types'
import { Letter } from '../components/Letter'

interface UseLetterGridProps {
  letterSet: BooleanMap
  usedLetters: BooleanMap
  roundStarted: boolean
  onLetterSelect: (letter: string) => void
}

export const useLetterGrid = ({
  letterSet,
  usedLetters,
  roundStarted,
  onLetterSelect,
}: UseLetterGridProps): ReactElement => {
  const handleLetterClick = useCallback(
    (letter: string) => {
      if (roundStarted) {
        onLetterSelect(letter)
      }
    },
    [roundStarted, onLetterSelect]
  )

  const letterGrid = useMemo(
    () => (
      <div className='container letters-container has-text-centered mb-4'>
        {Object.keys(letterSet).map((letter) => (
          <Letter
            key={letter}
            label={letter}
            used={letter in usedLetters}
            toggleSelectLetter={handleLetterClick}
          />
        ))}
      </div>
    ),
    [letterSet, usedLetters, handleLetterClick]
  )

  return letterGrid
}

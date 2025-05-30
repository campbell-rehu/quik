import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { useLetterGrid } from '../useLetterGrid'
import { BooleanMap } from '../../types'

const TestComponent: React.FC<{
  letterSet: BooleanMap
  usedLetters: BooleanMap
  roundStarted: boolean
  onLetterSelect: (letter: string) => void
}> = ({ letterSet, usedLetters, roundStarted, onLetterSelect }) => {
  const letterGrid = useLetterGrid({
    letterSet,
    usedLetters,
    roundStarted,
    onLetterSelect,
  })
  return <div>{letterGrid}</div>
}

describe('useLetterGrid', () => {
  const mockOnLetterSelect = jest.fn()
  const letterSet: BooleanMap = { A: true, B: true, C: true }
  const usedLetters: BooleanMap = { A: true }

  beforeEach(() => {
    mockOnLetterSelect.mockClear()
  })

  it('renders all letters from letterSet', () => {
    render(
      <TestComponent
        letterSet={letterSet}
        usedLetters={usedLetters}
        roundStarted={true}
        onLetterSelect={mockOnLetterSelect}
      />
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('applies used class to used letters', () => {
    render(
      <TestComponent
        letterSet={letterSet}
        usedLetters={usedLetters}
        roundStarted={true}
        onLetterSelect={mockOnLetterSelect}
      />
    )
    const usedLetter = screen.getByText('A')
    expect(usedLetter).toHaveClass('is-used')
    expect(usedLetter).toBeDisabled()
  })

  it('applies selectable class to unused letters when round is started', () => {
    render(
      <TestComponent
        letterSet={letterSet}
        usedLetters={usedLetters}
        roundStarted={true}
        onLetterSelect={mockOnLetterSelect}
      />
    )
    const selectableLetter = screen.getByText('B')
    expect(selectableLetter).toHaveClass('is-selectable')
    expect(selectableLetter).not.toBeDisabled()
  })

  it('does not apply selectable class when round is not started', () => {
    render(
      <TestComponent
        letterSet={letterSet}
        usedLetters={usedLetters}
        roundStarted={false}
        onLetterSelect={mockOnLetterSelect}
      />
    )
    const letter = screen.getByText('B')
    expect(letter).not.toHaveClass('is-selectable')
  })

  it('calls onLetterSelect when clicking unused letter during round', () => {
    render(
      <TestComponent
        letterSet={letterSet}
        usedLetters={usedLetters}
        roundStarted={true}
        onLetterSelect={mockOnLetterSelect}
      />
    )
    fireEvent.click(screen.getByText('B'))
    expect(mockOnLetterSelect).toHaveBeenCalledWith('B')
  })

  it('does not call onLetterSelect when clicking used letter', () => {
    render(
      <TestComponent
        letterSet={letterSet}
        usedLetters={usedLetters}
        roundStarted={true}
        onLetterSelect={mockOnLetterSelect}
      />
    )
    fireEvent.click(screen.getByText('A'))
    expect(mockOnLetterSelect).not.toHaveBeenCalled()
  })
})

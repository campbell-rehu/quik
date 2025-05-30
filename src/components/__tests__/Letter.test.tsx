import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { Letter } from '../Letter'

describe('Letter', () => {
  const mockToggleSelectLetter = jest.fn()

  beforeEach(() => {
    mockToggleSelectLetter.mockClear()
  })

  it('renders letter correctly', () => {
    render(
      <Letter
        label='A'
        used={false}
        toggleSelectLetter={mockToggleSelectLetter}
      />
    )
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('calls toggleSelectLetter when clicked and not used', () => {
    render(
      <Letter
        label='A'
        used={false}
        toggleSelectLetter={mockToggleSelectLetter}
      />
    )
    fireEvent.click(screen.getByText('A'))
    expect(mockToggleSelectLetter).toHaveBeenCalledWith('A')
  })

  it('does not call toggleSelectLetter when clicked and used', () => {
    render(
      <Letter
        label='A'
        used={true}
        toggleSelectLetter={mockToggleSelectLetter}
      />
    )
    fireEvent.click(screen.getByText('A'))
    expect(mockToggleSelectLetter).not.toHaveBeenCalled()
  })

  it('applies used class when letter is used', () => {
    render(
      <Letter
        label='A'
        used={true}
        toggleSelectLetter={mockToggleSelectLetter}
        className='letter-button'
      />
    )
    const button = screen.getByText('A')
    expect(button).toHaveClass('letter-button')
    expect(button).toBeDisabled()
  })

  it('applies custom className when provided', () => {
    render(
      <Letter
        label='A'
        used={false}
        toggleSelectLetter={mockToggleSelectLetter}
        className='custom-class'
      />
    )
    expect(screen.getByText('A')).toHaveClass('custom-class')
  })
})

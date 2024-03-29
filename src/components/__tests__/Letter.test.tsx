import React from 'react'
import { screen, render } from '@testing-library/react'
import { Letter } from '../Letter'
import userEvent from '@testing-library/user-event'

describe('Letter', () => {
  it('renders the letter', () => {
    render(<Letter label='A' used={false} toggleSelectLetter={jest.fn()} />)
    expect(screen.getByText('A')).toBeDefined()
  })
  it('contains the .used class name when used is true', () => {
    render(<Letter label='A' used={true} toggleSelectLetter={jest.fn()} />)
    const el = screen.getByText('A')
    expect(el).toBeDefined()
    expect(el.classList.contains('used')).toBeTruthy()
  })
  it('calls toggleSelectLetter when clicked', () => {
    const toggleSelectLetterMock = jest.fn()
    render(
      <Letter
        label='A'
        used={false}
        toggleSelectLetter={toggleSelectLetterMock}
      />
    )
    const el = screen.getByText('A')
    expect(el).toBeDefined()
    userEvent.click(el)
    expect(toggleSelectLetterMock).toBeCalled()
  })
})

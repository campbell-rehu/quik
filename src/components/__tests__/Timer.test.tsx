import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { Timer } from '../Timer'
import { Player } from '../../types'

// Mock the WebSocket context
jest.mock('../WebsocketContext', () => ({
  useWebSocketContext: () => ({
    socket: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}))

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useParams: () => ({ roomId: 'test-room' }),
}))

describe('Timer', () => {
  const mockCurrentPlayer: Player = {
    id: 'player-1',
    name: 'Player 1',
    eliminated: false,
    isTurn: true,
  }

  const defaultProps = {
    reset: false,
    currentPlayer: mockCurrentPlayer,
    isCurrentPlayer: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders timer with initial seconds', () => {
    render(<Timer {...defaultProps} />)
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('shows progress bar with primary color when seconds > 6', () => {
    render(<Timer {...defaultProps} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveClass('is-primary')
  })

  it('shows progress bar with warning color when seconds <= 6 and > 3', () => {
    const { rerender } = render(<Timer {...defaultProps} />)
    // Simulate timer tick
    const socket = require('../WebsocketContext').useWebSocketContext().socket
    socket.on.mock.calls[0][1]({ countdown: 5 })
    rerender(<Timer {...defaultProps} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveClass('is-warning')
  })

  it('shows progress bar with danger color when seconds <= 3', () => {
    const { rerender } = render(<Timer {...defaultProps} />)
    // Simulate timer tick
    const socket = require('../WebsocketContext').useWebSocketContext().socket
    socket.on.mock.calls[0][1]({ countdown: 2 })
    rerender(<Timer {...defaultProps} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveClass('is-danger')
  })

  it('shows timeout message for current player', () => {
    const { rerender } = render(<Timer {...defaultProps} />)
    // Simulate timer reaching zero
    const socket = require('../WebsocketContext').useWebSocketContext().socket
    socket.on.mock.calls[0][1]({ countdown: 0 })
    rerender(<Timer {...defaultProps} />)
    expect(screen.getByText('You ran out of time!')).toBeInTheDocument()
  })

  it('shows timeout message for other player', () => {
    const { rerender } = render(
      <Timer {...defaultProps} isCurrentPlayer={false} />
    )
    // Simulate timer reaching zero
    const socket = require('../WebsocketContext').useWebSocketContext().socket
    socket.on.mock.calls[0][1]({ countdown: 0 })
    rerender(<Timer {...defaultProps} isCurrentPlayer={false} />)
    expect(screen.getByText('Player 1 ran out of time!')).toBeInTheDocument()
  })

  it('resets timer when reset button is clicked', () => {
    const { rerender } = render(<Timer {...defaultProps} />)
    // Simulate timer reaching zero
    const socket = require('../WebsocketContext').useWebSocketContext().socket
    socket.on.mock.calls[0][1]({ countdown: 0 })
    rerender(<Timer {...defaultProps} />)

    fireEvent.click(screen.getByText('Reset'))
    expect(socket.emit).toHaveBeenCalledWith(
      'reset-timer',
      JSON.stringify({ roomId: 'test-room' })
    )
  })

  it('resets timer when reset prop changes to true', () => {
    const { rerender } = render(<Timer {...defaultProps} />)
    rerender(<Timer {...defaultProps} reset={true} />)
    const socket = require('../WebsocketContext').useWebSocketContext().socket
    expect(socket.emit).toHaveBeenCalledWith(
      'reset-timer',
      JSON.stringify({ roomId: 'test-room' })
    )
  })
})

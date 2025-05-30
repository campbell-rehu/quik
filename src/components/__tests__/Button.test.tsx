import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { Button } from '../Button'
import { NavigationContextProvider } from '../NavigationContext'
import { Page } from '../../types'

const withNavigationProvider = (component: React.ReactNode) => (
  <NavigationContextProvider>{component}</NavigationContextProvider>
)

describe('Button', () => {
  const mockOnClick = jest.fn()

  beforeEach(() => {
    mockOnClick.mockClear()
  })

  it('renders button with label', () => {
    render(<Button onClick={mockOnClick} label='Click me' />)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    render(<Button onClick={mockOnClick} label='Click me' />)
    fireEvent.click(screen.getByText('Click me'))
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('applies custom classes', () => {
    render(
      <Button onClick={mockOnClick} label='Click me' classes='custom-class' />
    )
    expect(screen.getByText('Click me')).toHaveClass('custom-class')
  })

  it('renders as disabled when disabled prop is true', () => {
    render(<Button onClick={mockOnClick} label='Click me' disabled />)
    const button = screen.getByText('Click me')
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('renders as a link when to prop is provided', () => {
    render(<Button onClick={mockOnClick} label='Click me' to={Page.Game} />)
    const link = screen.getByText('Click me')
    expect(link).toHaveAttribute('href', `/${Page.Game}`)
  })

  it('applies default button classes', () => {
    render(<Button onClick={mockOnClick} label='Click me' />)
    expect(screen.getByText('Click me')).toHaveClass('button', 'is-primary')
  })
})

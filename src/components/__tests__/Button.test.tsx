import { screen, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Page } from '../../types'
import { Button } from '../Button'
import { NavigationContextProvider } from '../NavigationContext'

const withNavigationProvider = (component: React.ReactNode) => (
  <BrowserRouter>
    <NavigationContextProvider>{component}</NavigationContextProvider>
  </BrowserRouter>
)

describe('Button', () => {
  it('renders the button', () => {
    render(
      withNavigationProvider(<Button to={Page.Game} label='To the game' />)
    )
    expect(screen.getByText('To the game')).toBeDefined()
  })
  it('calls the optional onclick handler', () => {
    const onclick = jest.fn()
    render(
      withNavigationProvider(
        <Button to={Page.Game} label='To the game' onClick={onclick} />
      )
    )
    const button = screen.getByText('To the game')
    expect(button).toBeDefined()
    userEvent.click(button)
    expect(onclick).toBeCalled()
  })
  describe('if no label is provided', () => {
    it('renders the button with the page name', () => {
      render(withNavigationProvider(<Button to={Page.Game} />))
      expect(screen.getByText(Page.Game)).toBeDefined()
    })
  })
})

import { render, screen } from '@testing-library/react'
import { createMemoryHistory, MemoryHistory } from '@remix-run/router'
import React from 'react'
import { unstable_HistoryRouter as Router } from 'react-router-dom'
import { Page, Routes } from '../../types'
import { Button } from '../Button'
import {
  NavigationContextProvider,
  useNavigationContext,
} from '../NavigationContext'
import userEvent from '@testing-library/user-event'

const withRouter = (component: React.ReactNode, history: MemoryHistory) => {
  return <Router history={history}>{component}</Router>
}
const withNavigationContextProvider = (component: React.ReactNode) => (
  <NavigationContextProvider>{component}</NavigationContextProvider>
)

const TestComponent: React.FC<{ page: Page }> = ({ page }) => {
  const { goToPage } = useNavigationContext()
  return <button onClick={() => goToPage(page)}>{page}</button>
}

describe('NavigationContext', () => {
  it('renders the child component', () => {
    const history = createMemoryHistory({ initialEntries: ['/'] })
    const page = Page.Game
    render(
      withRouter(withNavigationContextProvider(<Button to={page} />), history)
    )
    const btn = screen.getByText(page)
    expect(btn).toBeDefined()
  })
  it('updates the current route when goToPage is clicked', () => {
    const history = createMemoryHistory({ initialEntries: ['/'] })
    const page = Page.Game
    render(
      withRouter(
        withNavigationContextProvider(<TestComponent page={page} />),
        history
      )
    )
    const btn = screen.getByText(page)
    expect(btn).toBeDefined()
    userEvent.click(btn)
    expect(history.location.pathname).toBe(Routes[page])
  })
})

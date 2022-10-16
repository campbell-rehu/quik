import { render, screen } from '@testing-library/react'
import { createMemoryHistory, MemoryHistory } from '@remix-run/router'
import React, { useEffect } from 'react'
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

const ShowNavBarComponet: React.FC<{}> = () => {
  const { setShowNavBar } = useNavigationContext()
  useEffect(() => {
    setShowNavBar(true)
  }, [setShowNavBar])
  return (
    <button onClick={() => setShowNavBar(false)}>Show Navbar Component</button>
  )
}

const SetNavItemsComponent: React.FC<{ navItems?: React.ReactNode }> = ({
  navItems,
}) => {
  const { setShowNavBar, setNavItems } = useNavigationContext()
  useEffect(() => {
    setShowNavBar(true)
    setNavItems(
      <>
        <div>NavItem 1</div>
        <div>NavItem 2</div>
      </>
    )
  }, [setShowNavBar, setNavItems])
  return (
    <button onClick={() => setNavItems(navItems)}>
      Set NavItems Component
    </button>
  )
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
  it('renders the navbar when showNavBar is true', () => {
    const history = createMemoryHistory({ initialEntries: ['/'] })
    render(
      withRouter(withNavigationContextProvider(<ShowNavBarComponet />), history)
    )
    expect(screen.getByText('Show Navbar Component')).toBeDefined()
    expect(screen.getByRole('navigation')).toBeDefined()
  })
  it('hides the navbar when showNavBar is false', () => {
    const history = createMemoryHistory({ initialEntries: ['/'] })
    render(
      withRouter(withNavigationContextProvider(<ShowNavBarComponet />), history)
    )
    const btn = screen.getByText('Show Navbar Component')
    expect(btn).toBeDefined()
    // initially renders the navbar
    expect(screen.getByRole('navigation')).toBeDefined()
    // click the button to hide the navbar
    userEvent.click(btn)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
  it('renders the navitems when setNavItems is called', () => {
    const history = createMemoryHistory({ initialEntries: ['/'] })
    render(
      withRouter(
        withNavigationContextProvider(
          <SetNavItemsComponent
            navItems={
              <>
                <div>NavItem 3</div>
                <div>NavItem 4</div>
              </>
            }
          />
        ),
        history
      )
    )
    const btn = screen.getByText('Set NavItems Component')
    expect(btn).toBeDefined()
    expect(screen.getByRole('navigation')).toBeDefined()
    expect(screen.getByText('NavItem 1')).toBeDefined()
    expect(screen.getByText('NavItem 2')).toBeDefined()

    // click the button to change the nav items
    userEvent.click(btn)
    expect(screen.getByText('NavItem 3')).toBeDefined()
    expect(screen.getByText('NavItem 4')).toBeDefined()
  })
})

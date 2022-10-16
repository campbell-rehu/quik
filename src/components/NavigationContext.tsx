/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { PropsWithChildren, useState } from 'react'
import { Page } from '../types'
import { PageToRoute } from '../constants'
import { useNavigate } from 'react-router-dom'

type Value = {
  goToPage: (page: Page) => void
  setNavItems: (navItems: React.ReactNode) => void
  setShowNavBar: (showNav: boolean) => void
}

const defaultValue: Value = {
  goToPage: () => {},
  setNavItems: () => {},
  setShowNavBar: () => {},
}

const NavigationContext = React.createContext(defaultValue)

export const useNavigationContext = () => React.useContext(NavigationContext)

export const NavigationContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const navigate = useNavigate()
  const [navItems, setNavItems] = useState<React.ReactNode>(null)
  const [showNavBar, setShowNavBar] = useState<boolean>(false)

  const renderNavBar = () => {
    return (
      <>
        {showNavBar ? (
          <nav
            className='navbar block is-primary'
            role='navigation'
            aria-label='main navigation'>
            <div className='navbar-brand'>
              <a className='navbar-item' href='/splash'>
                <strong>Quik</strong>
              </a>
              <a
                role='button'
                className='navbar-burger'
                aria-label='menu'
                aria-expanded='false'
                data-target='quik-navbar'>
                <span aria-hidden='true'></span>
                <span aria-hidden='true'></span>
                <span aria-hidden='true'></span>
              </a>
            </div>
            <div id='quik-navbar' className='navbar-menu'>
              <div className='navbar-start'>{navItems}</div>
            </div>
          </nav>
        ) : null}
      </>
    )
  }

  return (
    <NavigationContext.Provider
      value={{
        goToPage: (page: Page) => navigate(PageToRoute[page]),
        setNavItems,
        setShowNavBar,
      }}>
      <>
        {renderNavBar()}
        {children}
      </>
    </NavigationContext.Provider>
  )
}

import React, { PropsWithChildren } from 'react'
import { Page } from './types'
import { PageToRoute } from './constants'
import { useNavigate } from 'react-router-dom'

type Value = {
  goToPage: (page: Page) => void
}

const defaultValue: Value = {
  goToPage: () => {},
}

const NavigationContext = React.createContext(defaultValue)

export const useNavigationContext = () => React.useContext(NavigationContext)

export const NavigationContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const navigate = useNavigate()

  return (
    <NavigationContext.Provider
      value={{
        goToPage: (page: Page) => navigate(PageToRoute[page]),
      }}>
      {children}
    </NavigationContext.Provider>
  )
}

import React from 'react'
import { useNavigationContext } from './NavigationContext'
import { Page } from './types'

interface Props {
  to: Page
  label?: string
}

export const Button: React.FC<Props> = ({ to, label }) => {
  const { goToPage } = useNavigationContext()
  return <button onClick={() => goToPage(to)}>{label || to}</button>
}

import React, { MouseEvent } from 'react'
import { useNavigationContext } from './NavigationContext'
import { Page } from './types'

interface Props {
  to: Page
  label?: string
  onClick?: (e: MouseEvent) => void
}

export const Button: React.FC<Props> = ({ to, label, onClick }) => {
  const { goToPage } = useNavigationContext()
  return (
    <button
      onClick={(e) => {
        if (onClick) {
          onClick(e)
        }
        goToPage(to)
      }}>
      {label || to}
    </button>
  )
}

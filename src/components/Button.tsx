import classNames from 'classnames'
import React, { MouseEvent } from 'react'
import { useNavigationContext } from './NavigationContext'
import { Link } from 'react-router-dom'

interface Props {
  to?: string
  label?: string
  onClick?: (e: MouseEvent) => void
  classes?: string
  disabled?: boolean
}

export const Button: React.FC<Props> = ({
  to,
  label,
  onClick,
  classes,
  disabled,
}) => {
  const { goToPage } = useNavigationContext()

  if (to) {
    return (
      <Link to={to} className={classes}>
        {label}
      </Link>
    )
  }

  return (
    <button
      className={classNames('button is-primary', classes)}
      onClick={(e) => {
        if (onClick) {
          onClick(e)
        }
        if (to) {
          goToPage(to)
        }
      }}
      disabled={disabled}>
      {label || to}
    </button>
  )
}

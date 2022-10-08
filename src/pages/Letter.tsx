import classNames from 'classnames'
import React from 'react'

interface Props {
  canSelect: boolean
  label: string
  used: boolean
  toggleSelectLetter: (letter: string) => void
}

export const Letter: React.FC<Props> = ({
  canSelect,
  label,
  used,
  toggleSelectLetter,
}) => {
  return (
    <div
      className={classNames('letter', { used: used })}
      onClick={() => canSelect && toggleSelectLetter(label)}>
      {label}
    </div>
  )
}

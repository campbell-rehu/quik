import classNames from 'classnames'
import React from 'react'

interface Props {
  label: string
  used: boolean
  toggleSelectLetter: (letter: string) => void
}

export const Letter: React.FC<Props> = ({
  label,
  used,
  toggleSelectLetter,
}) => {
  return (
    <div
      className={classNames('letter', { used: used })}
      onClick={() => toggleSelectLetter(label)}>
      {label}
    </div>
  )
}

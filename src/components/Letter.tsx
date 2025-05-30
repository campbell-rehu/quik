import React from 'react'

interface Props {
  label: string
  used: boolean
  toggleSelectLetter: (letter: string) => void
  className?: string
}

export const Letter: React.FC<Props> = ({
  label,
  used,
  toggleSelectLetter,
  className,
}) => {
  return (
    <button
      className={className}
      onClick={() => toggleSelectLetter(label)}
      disabled={used}>
      {label}
    </button>
  )
}

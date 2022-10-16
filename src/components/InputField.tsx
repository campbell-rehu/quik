import React from 'react'

interface Props {
  inputProps: React.InputHTMLAttributes<HTMLInputElement>
  inputRef: React.RefObject<HTMLInputElement>
  buttonLabel: string
  onClick: () => void
}

export const InputField: React.FC<Props> = ({
  inputRef,
  inputProps,
  onClick,
  buttonLabel,
}) => {
  return (
    <>
      <div className='field has-addons'>
        <div className='control'>
          <input
            {...inputProps}
            className='input is-primary'
            type='text'
            ref={inputRef}
          />
        </div>
        <div className='control'>
          <button type='button' className='button is-primary' onClick={onClick}>
            {buttonLabel}
          </button>
        </div>
      </div>
    </>
  )
}

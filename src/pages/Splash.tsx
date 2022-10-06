import React from 'react'
import { Button } from './Button'
import { Page } from './types'

export const Splash: React.FC<{}> = () => {
  return (
    <div>
      <h1>quick</h1>
      <Button to={Page.Lobby} />
    </div>
  )
}

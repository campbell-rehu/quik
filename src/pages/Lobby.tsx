import React from 'react'
import { Button } from './Button'
import { Page } from './types'

export const Lobby: React.FC<{}> = () => {
  return (
    <>
      <h1>This is the lobby</h1>
      <Button to={Page.Splash} label='Back' />
      <Button to={Page.InGame} label='Play' />
    </>
  )
}

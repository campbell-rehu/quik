import React from 'react'
import { Button } from '../components/Button'
import { Page } from '../types'

export const Splash: React.FC<{}> = () => {
  return (
    <div>
      <h1>quik</h1>
      <Button to={Page.Lobby} />
    </div>
  )
}

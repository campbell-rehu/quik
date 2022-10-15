import React from 'react'
import { Button } from '../components/Button'
import { Page } from '../types'

export const Splash: React.FC<{}> = () => {
  return (
    <section className='hero is-large is-success'>
      <div className='hero-body'>
        <div className=''>
          <p className='title'>Quik</p>
          <div className='buttons'>
            <Button to={Page.Lobby} label='How to Play' />
            <Button to={Page.Game} label='Play Now' />
          </div>
        </div>
      </div>
    </section>
  )
}

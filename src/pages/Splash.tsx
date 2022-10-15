import React, { useEffect } from 'react'
import { Button } from '../components/Button'
import { useNavigationContext } from '../components/NavigationContext'
import { Page } from '../types'

export const Splash: React.FC<{}> = () => {
  const { setShowNavBar } = useNavigationContext()
  useEffect(() => {
    setShowNavBar(false)
  }, [])
  return (
    <section className='hero is-large is-success'>
      <div className='hero-body'>
        <div className=''>
          <p className='title'>Quik</p>
          <div className='buttons'>
            <Button to={Page.HowToPlay} />
            <Button to={Page.Game} label='Play Now' />
          </div>
        </div>
      </div>
    </section>
  )
}

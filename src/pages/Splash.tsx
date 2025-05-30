import React, { useEffect } from 'react'
import { Button } from '../components/Button'
import { useNavigationContext } from '../components/NavigationContext'
import { Page, Routes as QuikRoutes } from '../types'

export const Splash: React.FC<{}> = () => {
  const { setShowNavBar } = useNavigationContext()
  useEffect(() => {
    setShowNavBar(false)
  }, [setShowNavBar])
  return (
    <section className='hero is-large is-success'>
      <div className='hero-body'>
        <div className=''>
          <p className='title'>Quik</p>
          <div className='buttons'>
            <Button to={QuikRoutes.HowToPlay} label={Page.HowToPlay} />
            <Button to={QuikRoutes.Game} label='Play Now' />
          </div>
        </div>
      </div>
    </section>
  )
}

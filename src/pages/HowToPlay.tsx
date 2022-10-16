import React, { useEffect } from 'react'
import { useNavigationContext } from '../components/NavigationContext'
import { Routes } from '../types'

export const HowToPlay: React.FC<{}> = () => {
  const { setNavItems, setShowNavBar } = useNavigationContext()
  useEffect(() => {
    setNavItems(
      <>
        <a className='navbar-item' href={Routes.Splash}>
          Back
        </a>
        <a className='navbar-item' href={Routes.Game}>
          Play Now
        </a>
      </>
    )
    setShowNavBar(true)
  }, [setNavItems, setShowNavBar])
  return (
    <>
      <div className='content'>
        <h1>How to play Quik</h1>

        <p>
          <strong>Quik</strong> is a fun, fast-paced multiplayer game that will
          test your knowledge on different topics!
        </p>
        <h2>How to play</h2>
        <h3>Game format</h3>
        <p>
          A game is comprised of multiple rounds and each round ends when a
          player is eliminated.
        </p>
        <h3>Gameplay</h3>
        <p>
          At the start of each round you will be presented with 20 letters of
          the alphabet. The game will also choose a topic for the round. Each
          player will have <b>10 seconds</b> to select a letter and call out a
          word or phrase that starts with that letter and is related to the
          topic.
        </p>
        <p>
          For example, if the topic is <strong>Things that are round</strong>, I
          could choose the letter <strong>C</strong> and say{' '}
          <strong>circle</strong>.
        </p>
        <p>A letter can only be used once per round.</p>
        <p>
          If the timer runs out before a player can call out their word or
          phrase, they are out of the game.
        </p>
        <p>The game continues until there is only one player remaining.</p>
        <p>
          If all letters are used in a round without a player being eliminated,
          the round restarts with the same topic but each player must say{' '}
          <strong>two</strong> words or phrases starting with their selected
          letter and relating to the topic
        </p>
      </div>
    </>
  )
}

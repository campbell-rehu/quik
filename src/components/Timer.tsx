import classNames from 'classnames'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { useRoomContext } from './RoomContext'
import { useWebSocketContext } from './WebsocketContext'

interface Props {
  reset: boolean
}

export const Timer: React.FC<Props> = ({ reset }) => {
  const { socket } = useWebSocketContext()
  const { roomId } = useRoomContext()
  const [seconds, setSeconds] = useState<number>(10)
  const [timerStarted, setTimerStarted] = useState<boolean>(false)
  const resetTimer = () => {
    setSeconds(10)
    socket?.emit('reset-timer', JSON.stringify({ roomId }))
    // Reset focus on the section for keydown listener
    const roomSection = document
      .getElementsByClassName('room')
      .item(0) as HTMLElement
    roomSection.focus()
  }

  useEffect(() => {
    if (reset) {
      resetTimer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset])

  useEffect(() => {
    socket?.on('tick', ({ countdown }) => {
      setSeconds(countdown)
    })

    return () => {
      socket?.off('tick')
    }
  }, [socket])

  const renderTimer = () => {
    if (!timerStarted) {
      return (
        <div className='container'>
          <div className='buttons is-centered'>
            <button
              className='button is-primary'
              onClick={() => {
                setTimerStarted(true)
                resetTimer()
                socket?.emit('countdown-started', JSON.stringify({ roomId }))
              }}>
              Start round
            </button>
          </div>
        </div>
      )
    }
    return (
      <>
        {seconds === 0 ? (
          <div className='container'>
            <h1 className='title has-text-centered'>Player lost!</h1>
            <div className='buttons is-centered'>
              <button
                className='button is-primary'
                onClick={() => resetTimer()}>
                Reset
              </button>
            </div>
          </div>
        ) : (
          <div className='container'>
            <p className='mb-3 is-size-4 has-text-centered'>
              <strong>{seconds}</strong>
            </p>
            <progress
              className={classNames('progress is-large', {
                'is-primary': seconds > 6,
                'is-warning': seconds > 3 && seconds <= 6,
                'is-danger': seconds > 0 && seconds <= 3,
              })}
              max={10}
              value={seconds}>
              {seconds}
            </progress>
          </div>
        )}
      </>
    )
  }

  return <div className='container block'>{renderTimer()}</div>
}

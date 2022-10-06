import React, { useState } from 'react'
import { useEffect } from 'react'
import Countdown from 'react-countdown'
import { DefaultTurnDuration } from './constants'

interface Props {
  reset: boolean
  duration?: number
}

export const Timer: React.FC<Props> = ({
  reset,
  duration = DefaultTurnDuration,
}) => {
  const [end, setEnd] = useState<number>(Date.now() + duration)
  const [key, setKey] = useState<number>(0)
  const resetTimer = () => {
    setEnd(Date.now() + duration)
    setKey((prev) => prev + 1)
  }

  useEffect(() => {
    if (reset) {
      resetTimer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset])

  return (
    <div className='timer-container'>
      <Countdown
        date={end}
        key={key}
        renderer={({ seconds, completed }) => {
          if (completed) {
            return (
              <>
                <div>Player lost!</div>
                <button onClick={() => resetTimer()}>Reset</button>
              </>
            )
          }

          return (
            <>
              <div>{seconds}</div>
            </>
          )
        }}
      />
    </div>
  )
}

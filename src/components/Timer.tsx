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
  const resetTimer = () => {
    setSeconds(10)
    socket?.emit('reset-timer', JSON.stringify({ roomId }))
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

  return (
    <div className='timer-container'>
      {seconds === 0 ? (
        <>
          <div>Player lost!</div>
          <button onClick={() => resetTimer()}>Reset</button>
        </>
      ) : (
        <>{seconds}</>
      )}
    </div>
  )
}

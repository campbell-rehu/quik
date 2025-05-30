import React, { useEffect, useRef, useState } from 'react'
import './Game.css'
import {
  useWebSocketContext,
  WebSocketContextProvider,
} from '../components/WebsocketContext'
import { Room } from './Room'
import { useRoomContext } from '../components/RoomContext'
import { Player, PlayersById, Routes } from '../types'
import { InputField } from '../components/InputField'
import { useNavigationContext } from '../components/NavigationContext'
import { SocketEventType } from '../constants'
import { Button } from '../components/Button'
import { useParams } from 'react-router-dom'

interface Props {
  hardMode?: boolean
}

export const GameContainer: React.FC<{}> = () => {
  const { setShowNavBar, setNavItems } = useNavigationContext()
  useEffect(() => {
    setShowNavBar(true)
    setNavItems(
      <a className='navbar-item' href={Routes.HowToPlay}>
        How To Play
      </a>
    )
  }, [setNavItems, setShowNavBar])

  return (
    <WebSocketContextProvider>
      <Setup />
    </WebSocketContextProvider>
  )
}

export const Setup: React.FC<Props> = ({ hardMode }) => {
  const { socket } = useWebSocketContext()
  const createRoomInput = useRef<HTMLInputElement>(null)
  const joinRoomInput = useRef<HTMLInputElement>(null)
  const setPlayerNameInput = useRef<HTMLInputElement>(null)
  const { playerName, createRoom, joinRoom, setPlayerName } = useRoomContext()
  const { roomId } = useParams()
  const [roomCurrentPlayer, setRoomCurrentPlayer] = useState<Player>({
    id: socket.id,
    name: 'Player',
    isTurn: false,
    eliminated: false,
  })
  const [players, setPlayers] = useState<PlayersById>({})
  const [roomHasEnoughPlayers, setRoomHasEnoughPlayers] =
    useState<boolean>(false)

  useEffect(() => {
    if (socket) {
      if (!roomId) {
        createRoomInput.current?.focus()
      } else if (!playerName) {
        setPlayerNameInput.current?.focus()
      }
    }
  }, [socket, roomId, playerName])

  useEffect(() => {
    socket.on(SocketEventType.RoomJoined, (data) => {
      const { players, currentPlayer, playerCount } = JSON.parse(data)
      setRoomCurrentPlayer(currentPlayer)
      setRoomHasEnoughPlayers(playerCount > 1)
      setPlayers(players)
    })
  }, [socket])

  return (
    <div className='setup-container'>
      {!roomId ? (
        <div className='setup-options'>
          <h1 className='title is-2 has-text-centered mb-6'>
            Welcome to Quik!
          </h1>
          <div className='buttons-container'>
            <Button
              classes='button is-primary is-large is-fullwidth mb-4'
              label='Create New Room'
              onClick={() => createRoom()}
            />
            <div className='divider'>
              <span className='divider-text'>or</span>
            </div>
            <InputField
              inputProps={{
                id: 'room-id',
                name: 'room-id',
                placeholder: 'Enter room code',
                className: 'input is-large',
              }}
              inputRef={joinRoomInput}
              buttonLabel='Join Room'
              onClick={() => {
                const input = document.querySelector(
                  '#room-id'
                ) as HTMLInputElement
                joinRoom(input.value)
              }}
            />
          </div>
        </div>
      ) : !playerName ? (
        <div className='player-setup'>
          <h2 className='title is-3 has-text-centered mb-4'>Enter Your Name</h2>
          <InputField
            inputProps={{
              id: 'player-name',
              name: 'player-name',
              placeholder: 'Your name',
              className: 'input is-large',
              autoFocus: true,
            }}
            inputRef={setPlayerNameInput}
            buttonLabel='Start Playing'
            onClick={() => {
              const input = document.querySelector(
                '#player-name'
              ) as HTMLInputElement
              setPlayerName(roomId, socket.id, input.value)
            }}
          />
        </div>
      ) : (
        <Room
          roomId={roomId}
          socket={socket}
          currentPlayer={roomCurrentPlayer}
          players={players}
          setPlayers={setPlayers}
          roomHasEnoughPlayers={roomHasEnoughPlayers}
          hardMode={hardMode}
        />
      )}
    </div>
  )
}

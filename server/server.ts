import { Server, Socket } from 'socket.io'
import express, { Express, Request, Response } from 'express'
import { clearInterval } from 'timers'
import { createServer } from 'http'
import cors from 'cors'
import { SocketEventTypes } from './types'
import { Room, Rooms } from './room'

var app: Express = express()
var http = createServer(app)
var io = new Server(http, {
  cors: {
    origin: '*',
  },
})

const port = 5000

app.use(cors({ origin: '*' }))
app.use(express.json())

let rooms = new Rooms()

// Create new game room
app.post('/room', (req: Request, res: Response) => {
  const room = rooms.initialiseNewRoom()
  const response = {
    id: room.getId(),
    usedLetters: room.getUsedLetters(),
  }
  res.json(response)
})

// Join existing game room
app.get('/room/:roomId', (req: Request, res: Response) => {
  const roomId = req.params.roomId
  const room = rooms.getRoom(roomId)
  if (!room) {
    res.status(404)
    return
  }
  const response = {
    id: room.getId(),
    usedLetters: room.getUsedLetters(),
  }
  res.json(response)
})

// Sets the name of the player with the given playerId
app.post('/player/:playerId/name', (req: Request, res: Response) => {
  const playerId = req.params.playerId
  const { roomId, playerName } = req.body

  const room = rooms.getRoom(roomId)
  room.addPlayer(playerId, playerName)
  res.json({ playerName })
})

io.on('connection', (socket: Socket) => {
  const clientIpAddress = socket.client.conn.remoteAddress
  console.log(`client with ip address=${clientIpAddress} connected`)

  socket.on('disconnect', () =>
    console.log(`client with ip address=${clientIpAddress} disconnected`)
  )

  socket.on(SocketEventTypes.JoinRoom, (roomId: string) => {
    console.log(
      `client with ip address=${clientIpAddress} joining room id=${roomId}`
    )

    socket.join(`${roomId}`)

    const room = rooms.getRoom(roomId)

    emitToRoom(socket, roomId, SocketEventTypes.RoomJoined, {
      usedLetters: room.getUsedLetters(),
      currentPlayer: room.getCurrentPlayer(),
    })

    handleCountdown(socket, room)
  })

  socket.on(SocketEventTypes.SelectLetter, (msg: any) => {
    var { roomId, letter, prevLetter } = JSON.parse(msg)
    console.debug(
      `message received from client with ip address=${clientIpAddress} for room=${roomId}, msg=${letter}`
    )
    const room = rooms.getRoom(roomId)
    var usedLetters = room.addUsedLetter(letter)
    if (prevLetter) {
      room.removeUsedLetter(prevLetter)
    }

    emitToRoom(socket, roomId, SocketEventTypes.LetterSelected, usedLetters)
  })

  socket.on(SocketEventTypes.EndTurn, (msg: any) => {
    var { roomId, selectedLetter } = JSON.parse(msg)
    const room = rooms.getRoom(roomId)
    room.setNextPlayer()
    room.resetCountdown()
    room.setLetterUnselectable(selectedLetter)
    emitToRoom(
      socket,
      roomId,
      SocketEventTypes.StartTurn,
      room.getCurrentPlayer()
    )
  })

  socket.on(SocketEventTypes.ResetTimer, (msg: any) => {
    var { roomId } = JSON.parse(msg)
    const room = rooms.getRoom(roomId)
    room.resetCountdown()
    handleCountdown(socket, room)
  })

  socket.on(SocketEventTypes.LeaveRoom, (msg: any) => {
    var { roomId, playerId } = JSON.parse(msg)
    // remove player from room
    const room = rooms.getRoom(roomId)
    room.removePlayer(playerId)
    // if no players remain in the room, clear the countdown and remove the room
    if (room.getNumberOfPlayers() === 0) {
      room.resetCountdown()
      rooms.removeRoom(roomId)
    }
    // TODO: handle setting player turn if current player leaves the room
  })
})

http.listen(port, () => {
  console.log(`listening on *:${port}`)
})

const emitToRoom = (
  socket: Socket,
  roomId: string,
  eventType: string,
  message: any
) => {
  console.log(
    `emitting message type=${eventType} to room id=${roomId}`,
    message
  )
  // emit message to room
  socket.to(`${roomId}`).emit(eventType, message)

  // emit message to sender
  socket.emit(eventType, message)
}

const handleCountdown = (socket: Socket, room: Room) => {
  const countdown = room.getCountdown()
  if (countdown.started) {
    return
  }
  countdown.started = true
  countdown.timer = setInterval(() => {
    countdown.time--
    emitToRoom(socket, room.getId(), SocketEventTypes.CountdownTick, {
      countdown: countdown.time,
    })
    if (countdown.time === 0) {
      clearInterval(countdown.timer)
    }
  }, 1000)
}

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
app.post('/room', function (req: Request, res: Response) {
  const room = rooms.initialiseNewRoom()
  const response = {
    id: room.getId(),
    usedLetters: room.getUsedLetters(),
  }
  res.json(response)
})

// Join existing game room
app.get('/room/:roomId', function (req: Request, res: Response) {
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

io.on('connection', function (socket: Socket) {
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

    room.addPlayer(socket.id)

    emitToRoom(socket, roomId, SocketEventTypes.RoomJoined, {
      usedLetters: room.getUsedLetters(),
      currentPlayer: room.getCurrentPlayer().id,
    })

    handleCountdown(socket, room)
  })

  socket.on(SocketEventTypes.SelectLetter, function (msg: any) {
    var { roomId, letter } = JSON.parse(msg)
    console.debug(
      `message received from client with ip address=${clientIpAddress} for room=${roomId}, msg=${letter}`
    )
    var usedLetters = rooms.getRoom(roomId).addUsedLetter(letter)

    emitToRoom(socket, roomId, SocketEventTypes.LetterSelected, usedLetters)
  })

  socket.on(SocketEventTypes.EndTurn, function (msg: any) {
    var { roomId, player } = JSON.parse(msg)
    const room = rooms.getRoom(roomId)
    const roomPlayerIds = Object.keys(room.getPlayers())
    var nextPlayerIndex = roomPlayerIds.indexOf(player) + 1
    if (nextPlayerIndex > roomPlayerIds.length - 1) {
      nextPlayerIndex = 0
    }
    var nextPlayer = roomPlayerIds[nextPlayerIndex]
    room.resetCountdown()
    emitToRoom(socket, roomId, SocketEventTypes.StartTurn, nextPlayer)
  })

  socket.on(SocketEventTypes.ResetTimer, (msg: any) => {
    var { roomId } = JSON.parse(msg)
    const room = rooms.getRoom(roomId)
    room.resetCountdown()
    handleCountdown(socket, room)
  })
})

http.listen(port, function () {
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

import { Server, Socket } from 'socket.io'
import express, { Express, Request, Response } from 'express'
import { clearInterval } from 'timers'
import { createServer } from 'http'
import { v4 } from 'uuid'
import cors from 'cors'
import { SocketEventTypes } from './types'

var app: Express = express()
var http = createServer(app)
var io = new Server(http, {
  cors: {
    origin: '*',
  },
})

const port = 5000

type PlayersByRoomId = {
  [roomId: string]: string[]
}

type UsedLettersByRoomId = {
  [roomId: string]: {
    [letter: string]: boolean
  }
}

type CountdownByRoomId = {
  [roomId: string]: {
    intervalId: NodeJS.Timer | undefined
    countdown: number
  }
}

let usedLettersByRoomId: UsedLettersByRoomId = {}
let playersByRoomId: PlayersByRoomId = {}
let roomCountdowns: CountdownByRoomId = {}

app.use(cors({ origin: '*' }))
app.use(express.json())

// Create new game room
app.post('/room', function (req, res, next) {
  const id = v4()
  if (Boolean(usedLettersByRoomId[id])) {
    res.status(400)
    return
  }
  usedLettersByRoomId[id] = {}
  roomCountdowns[id] = {
    intervalId: undefined,
    countdown: 10,
  }
  const response = {
    id,
    usedLetters: usedLettersByRoomId[id],
  }
  res.json(response)
})

// Join existing game room
app.get('/room/:roomId', function (req: Request, res: Response) {
  const roomId = req.params.roomId
  const response = {
    id: roomId,
    usedLetters: usedLettersByRoomId[roomId] ?? {},
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
    addPlayerToRoom(roomId, socket.id)
    emitToRoom(socket, roomId, SocketEventTypes.RoomJoined, {
      usedLetters: getRoomUsedLetters(roomId),
      currentPlayer: playersByRoomId[roomId][0],
    })
    handleCountdown(socket, roomId)
  })

  socket.on(SocketEventTypes.SelectLetter, function (msg: any) {
    var { roomId, letter } = JSON.parse(msg)
    console.debug(
      `message received from client with ip address=${clientIpAddress} for room=${roomId}, msg=${letter}`
    )
    // update letter state
    const usedLetters = getRoomUsedLetters(roomId)
    usedLetters[letter] = !Boolean(usedLetters[letter])

    emitToRoom(socket, roomId, SocketEventTypes.LetterSelected, usedLetters)
  })

  socket.on(SocketEventTypes.EndTurn, function (msg: any) {
    var { roomId, player } = JSON.parse(msg)
    var nextPlayerIndex = playersByRoomId[roomId].indexOf(player) + 1
    if (nextPlayerIndex > playersByRoomId[roomId].length - 1) {
      nextPlayerIndex = 0
    }
    var nextPlayer = playersByRoomId[roomId][nextPlayerIndex]
    emitToRoom(socket, roomId, SocketEventTypes.StartTurn, nextPlayer)
  })

  socket.on(SocketEventTypes.ResetTimer, (msg: any) => {
    var { roomId } = JSON.parse(msg)
    roomCountdowns[roomId].intervalId = undefined
    roomCountdowns[roomId].countdown = 10
    handleCountdown(socket, roomId)
  })
})

http.listen(port, function () {
  console.log(`listening on *:${port}`)
})

const getRoomUsedLetters = (roomId: string) => {
  if (!Boolean(usedLettersByRoomId[roomId])) {
    usedLettersByRoomId[roomId] = {}
  }
  return usedLettersByRoomId[roomId]
}

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

const addPlayerToRoom = (roomId: string, player: string) => {
  if (playersByRoomId[roomId]) {
    if (!playersByRoomId[roomId].includes(player)) {
      playersByRoomId[roomId].push(player)
    } else {
      console.log(`Player id=${player} is already in the room id=${roomId}`)
    }
  } else {
    playersByRoomId[roomId] = [player]
  }
}

const handleCountdown = (socket: Socket, roomId: string) => {
  roomCountdowns[roomId].intervalId = setInterval(() => {
    roomCountdowns[roomId].countdown--
    emitToRoom(socket, roomId, SocketEventTypes.CountdownTick, {
      countdown: roomCountdowns[roomId].countdown,
    })
    if (roomCountdowns[roomId].countdown === 0) {
      clearInterval(roomCountdowns[roomId].intervalId)
    }
  }, 1000)
}

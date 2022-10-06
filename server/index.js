var express = require('express')
var app = express()
// var expressWs = require('express-ws')(app);
var http = require('http').createServer(app)
var io = require('socket.io')(http, {
  cors: {
    origin: '*',
  },
})

const cors = require('cors')
var uuidv4 = require('uuid').v4
const port = 5000

let usedLettersByRoomId = {}

app.use(cors({ origin: '*' }))
app.use(express.json())

// Create new game room
app.post('/room', function (req, res, next) {
  const id = uuidv4()
  if (Boolean(usedLettersByRoomId[id])) {
    res.status(400)
    return
  }
  usedLettersByRoomId[id] = {}
  const response = {
    id,
    usedLetters: usedLettersByRoomId[id],
  }
  res.json(response)
})

// Join existing game room
app.get('/room/:roomId', function (req, res, next) {
  const roomId = req.params.roomId
  const response = {
    id: roomId,
    usedLetters: usedLettersByRoomId[roomId] ?? {},
  }
  res.json(response)
})

io.on('connection', function (socket) {
  const clientIpAddress = socket.client.conn.remoteAddress
  console.log(`client with ip address=${clientIpAddress} connected`)

  socket.on('disconnect', () =>
    console.log(`client with ip address=${clientIpAddress} disconnected`)
  )

  socket.on('join-room', (roomId) => {
    console.log(
      `client with ip address=${clientIpAddress} joining room id=${roomId}`
    )
    socket.join(`${roomId}`)
  })

  socket.on('select-letter', function (msg) {
    var { roomId, letter } = JSON.parse(msg)
    console.debug(
      `message received from client with ip address=${clientIpAddress} for room=${roomId}, msg=${letter}`
    )
    // update letter state
    const usedLetters = getRoomUsedLetters(roomId)
    usedLetters[letter] = !Boolean(usedLetters[letter])

    // emit message to room
    socket.to(`${roomId}`).emit('letter-selected', usedLetters)

    // emit message to sender
    socket.emit('letter-selected', usedLetters)
  })
})

http.listen(port, function () {
  console.log(`listening on *:${port}`)
})

const getRoomUsedLetters = (roomId) => {
  if (!Boolean(usedLettersByRoomId[roomId])) {
    usedLettersByRoomId[roomId] = {}
  }
  return usedLettersByRoomId[roomId]
}

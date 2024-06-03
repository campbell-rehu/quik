package socket

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/campbell-rehu/quik-be/helpers"
	roomPkg "github.com/campbell-rehu/quik-be/room"
	"github.com/campbell-rehu/quik-be/types"
	"github.com/zishang520/socket.io/socket"
)

type Socket struct {
	*socket.Server
	eventHandlers WSEventHandlers
}

type WSDoer = func(data ...any)

type WSEventHandler = func(client *socket.Socket) WSDoer

type WSEventHandlers = map[types.EventType]WSEventHandler

func NewSocket() *Socket {
	sock := socket.NewServer(nil, nil)
	eventHandlers := make(map[types.EventType]WSEventHandler)
	return &Socket{sock, eventHandlers}
}

func (s *Socket) RegisterWSHandlers() {
	s.registerWSHandler(types.EventTypeJoinRoom, s.OnJoinRoom)
	s.registerWSHandler(types.EventTypeDisconnect, s.OnDisconnect)
	s.registerWSHandler(types.EventTypeCountdownStarted, s.OnCountdownStarted)
	s.registerWSHandler(types.EventTypeSelectLetter, s.OnSelectLetter)
	s.registerWSHandler(types.EventTypeEndTurn, s.OnEndTurn)
	s.registerWSHandler(types.EventTypeResetTimer, s.OnResetTimer)
	s.registerWSHandler(types.EventTypeLeaveRoom, s.OnLeaveRoom)
}

func (s *Socket) HandleHTTP(w http.ResponseWriter, r *http.Request) {
	s.ServeHandler(nil).ServeHTTP(w, r)
}

func (s *Socket) HandleWS() {
	s.On(string(types.EventTypeConnection), func(clients ...any) {
		client := clients[0].(*socket.Socket)
		for k, f := range s.eventHandlers {
			client.On(string(k), f(client))
		}
	})
}

func (s *Socket) OnJoinRoom(client *socket.Socket) func(data ...any) {
	return func(data ...any) {
		helpers.Print(
			"client with id=%s ip address=%s joining room\n",
			client.Id(),
			client.Client().Conn().RemoteAddress(),
		)
		roomId := data[0].(string)
		room, err := roomPkg.GetRoom(roomId)
		if err != nil {
			helpers.PrintError(err)
			return
		}

		if room.IsLocked() {
			helpers.PrintError(
				errors.New(fmt.Sprintf("Room id=%s is locked. No new players can join", room.Id)),
			)
			return
		}

		client.Join(socket.Room(roomId))

		type x struct {
			Players       map[string]*types.Player `json:"players"`
			UsedLetters   map[string]bool          `json:"usedLetters"`
			CurrentPlayer *types.Player            `json:"currentPlayer"`
			PlayerCount   int                      `json:"playerCount"`
		}

		s.emitToRoom(client, roomId, types.EventTypeRoomJoined, &x{
			Players:       room.Players,
			UsedLetters:   room.UsedLetters,
			CurrentPlayer: room.CurrentPlayer,
			PlayerCount:   room.GetPlayerCount(),
		})
	}
}

func (s *Socket) OnDisconnect(client *socket.Socket) func(data ...any) {
	return func(data ...any) {
		helpers.Print(
			"client with id=%s ip address=%s disconnected\n",
			client.Id(),
			client.Client().Conn().RemoteAddress(),
		)

		playerId := string(client.Id())
		roomId := roomPkg.GetRoomId(playerId)
		room, err := roomPkg.GetRoom(roomId)
		if err != nil {
			helpers.PrintError(err)
			return
		}

		room.LeaveRoom(playerId)

		type msg struct {
			PlayerId string `json:"playerId"`
		}

		s.emitToRoom(client, roomId, types.EventTypeDisconnected, &msg{PlayerId: playerId})
	}
}

func (s *Socket) OnCountdownStarted(client *socket.Socket) func(data ...any) {
	return func(data ...any) {
		var t struct {
			RoomId string `json:"roomId"`
		}
		raw := data[0].(string)
		json.Unmarshal([]byte(raw), &t)

		roomId := t.RoomId
		room, err := roomPkg.GetRoom(roomId)
		if err != nil {
			helpers.PrintError(err)
			return
		}

		room.LockRoom()

		helpers.Print(
			"room with id=%s is now locked. no new players can join\n",
			room.Id,
		)

		s.emitToRoom(client, roomId, types.EventTypeRoomLocked, data)
		type x struct {
			Category      string          `json:"category"`
			UsedLetters   map[string]bool `json:"usedLetters"`
			CurrentPlayer *types.Player   `json:"currentPlayer"`
		}
		s.emitToRoom(client, roomId, types.EventTypeRoundStarted, &x{
			Category:      room.GetCategory(),
			UsedLetters:   room.UsedLetters,
			CurrentPlayer: room.CurrentPlayer,
		})

		s.handleCountdown(client, room)
	}
}

func (s *Socket) handleCountdown(client *socket.Socket, room *roomPkg.Room) {
	emitTick := func(tickChan chan int, doneCh chan bool) {
		s.EmitCountdownTick(client, room.Id, tickChan, doneCh)
	}

	emitEvent := func(eventType types.EventType, data any) {
		s.emitToRoom(client, room.Id, eventType, data)
	}

	room.StartTimer(emitTick, emitEvent)
}

func (s *Socket) EmitCountdownTick(
	client *socket.Socket,
	roomId string,
	tickChan chan int,
	doneChan chan bool,
) {
	type countdown struct {
		Countdown int `json:"countdown"`
	}
	for {
		select {
		case <-doneChan:
			return
		case tick := <-tickChan:
			s.emitToRoom(client, roomId, types.EventTypeCountdownTick, countdown{Countdown: tick})
		}
	}
}

func (s *Socket) OnSelectLetter(client *socket.Socket) func(data ...any) {
	return func(data ...any) {
		var t struct {
			RoomId         string `json:"roomId"`
			Letter         string `json:"letter"`
			PreviousLetter string `json:"prevLetter"`
		}
		raw := data[0].(string)
		json.Unmarshal([]byte(raw), &t)

		room, err := roomPkg.GetRoom(t.RoomId)
		if err != nil {
			helpers.PrintError(err)
			return
		}

		room.ToggleUsedLetter(t.Letter)

		if t.PreviousLetter != "" {
			room.RemoveUsedLetter(t.PreviousLetter)
		}
		s.emitToRoom(client, room.Id, types.EventTypeLetterSelected, room.UsedLetters)
	}
}

func (s *Socket) OnEndTurn(client *socket.Socket) func(data ...any) {
	return func(data ...any) {
		var t struct {
			RoomId         string `json:"roomId"`
			SelectedLetter string `json:"selectedLetter"`
		}
		raw := data[0].(string)
		json.Unmarshal([]byte(raw), &t)

		room, err := roomPkg.GetRoom(t.RoomId)
		if err != nil {
			helpers.PrintError(err)
			return
		}

		room.SetNextPlayerIndex()
		room.ResetTimer()

		room.SetLetterUnselectable(t.SelectedLetter)

		type endTurn struct {
			CurrentPlayer *types.Player   `json:"currentPlayer"`
			UsedLetters   map[string]bool `json:"usedLetters"`
		}

		s.emitToRoom(client, room.Id, types.EventTypeStartTurn, &endTurn{
			CurrentPlayer: room.GetCurrentPlayer(),
			UsedLetters:   room.UsedLetters,
		})
	}
}

func (s *Socket) OnResetTimer(client *socket.Socket) WSDoer {
	return func(data ...any) {
		helpers.Print(
			"client with id=%s ip address=%s reset-timer\n",
			client.Id(),
			client.Client().Conn().RemoteAddress(),
		)
		var t struct {
			RoomId string `json:"roomId"`
		}
		raw := data[0].(string)
		json.Unmarshal([]byte(raw), &t)

		room, err := roomPkg.GetRoom(t.RoomId)
		if err != nil {
			helpers.PrintError(err)
			return
		}

		room.ResetTimer()

		s.handleCountdown(client, room)
	}
}

func (s *Socket) OnLeaveRoom(client *socket.Socket) WSDoer {
	return func(data ...any) {
		helpers.Print(
			"client with id=%s ip address=%s leave-room\n",
			client.Id(),
			client.Client().Conn().RemoteAddress(),
		)
		var t struct {
			RoomId   string `json:"roomId"`
			PlayerId string `json:"playerId"`
		}
		raw := data[0].(string)
		json.Unmarshal([]byte(raw), &t)

		room, err := roomPkg.GetRoom(t.RoomId)
		if err != nil {
			helpers.PrintError(err)
			return
		}

		room.LeaveRoom(t.PlayerId)

		if room.GetPlayerCount() == 0 {
			room.ResetTimer()
			roomPkg.RemoveRoom(t.RoomId)
		}
	}
}

func (s *Socket) registerWSHandler(eventType types.EventType, f WSEventHandler) {
	s.eventHandlers[eventType] = f
}

func (s *Socket) emitToRoom(
	sock *socket.Socket,
	roomId string,
	eventType types.EventType,
	message any,
) {
	helpers.Print("emitting message type=%s to room id=%s, message=%+v", eventType, roomId, message)
	sock.To(socket.Room(roomId)).Emit(string(eventType), message)
	sock.Emit(string(eventType), message)
}

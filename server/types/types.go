package types

import (
	"encoding/json"
)

type EventType string

const (
	EventTypeConnection       EventType = "connection"
	EventTypeDisconnect       EventType = "disconnect"
	EventTypeJoinRoom         EventType = "join-room"
	EventTypeRoomJoined       EventType = "room-joined"
	EventTypeDisconnected     EventType = "disconnected"
	EventTypeRoomLocked       EventType = "room-locked"
	EventTypeCountdownStarted EventType = "countdown-started"
	EventTypeRoundStarted     EventType = "round-started"
	EventTypeCountdownTick    EventType = "tick"
	EventTypeSelectLetter     EventType = "select-letter"
	EventTypeLetterSelected   EventType = "letter-selected"
	EventTypeStartTurn        EventType = "start-turn"
	EventTypeEndTurn          EventType = "end-turn"
	EventTypeResetTimer       EventType = "reset-timer"
	EventTypeLeaveRoom        EventType = "leave-room"
	EventTypePlayerEliminated EventType = "player-eliminated"
	EventTypeRoundEnded       EventType = "round-ended"
	EventTypeGameEnded        EventType = "game-ended"
)

type Event struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

type Player struct {
	Id           string `json:"id"`
	Name         string `json:"name"`
	IsTurn       bool   `json:"isTurn"`
	Eliminated   bool   `json:"eliminated"`
	WinCount     int    `json:"winCount"`
	NextPlayerId string
}

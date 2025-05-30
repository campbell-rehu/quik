package room

import (
	"errors"
	"fmt"

	"github.com/campbell-rehu/quik-be/helpers"
)

var allRooms = newRooms()

type RoomIdAndPlayerId struct {
	RoomId   string
	PlayerId string
}

type Rooms struct {
	rooms            map[string]*Room
	playerIdToRoomId map[string]string
}

func newRooms() *Rooms {
	return &Rooms{
		rooms:            make(map[string]*Room),
		playerIdToRoomId: make(map[string]string),
	}
}

func AddRoom() *Room {
	room := NewRoom()
	allRooms.rooms[room.Id] = room
	return room
}

func GetRoom(roomId string) (*Room, error) {
	room, ok := allRooms.rooms[roomId]
	if !ok {
		return nil, errors.New(fmt.Sprintf("room with id=%s not found\n", roomId))
	}
	if room.GetPlayerCount() > 0 {
		room.CurrentPlayer = room.GetCurrentPlayer()
	}
	return room, nil
}

func AddPlayerIdToRoomIdMapping(playerId, roomId string) {
	allRooms.playerIdToRoomId[playerId] = roomId
}

func GetRoomId(playerId string) string {
	roomId, ok := allRooms.playerIdToRoomId[playerId]
	if !ok {
		return ""
	}
	return roomId
}

func RemovePlayerIdToRoomIdMapping(playerId string) {
	delete(allRooms.playerIdToRoomId, playerId)
}

func RemoveRoom(roomId string) {
	helpers.Print("room id=%s removed", roomId)
	delete(allRooms.rooms, roomId)
}

package api

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/campbell-rehu/quik-be/room"
)

type RoomHandler struct{}

func (h *RoomHandler) CreateRoom(w http.ResponseWriter, r *http.Request) {
	room := room.AddRoom()

	fmt.Printf("room created with id=%s\n", room.Id)

	res, err := json.Marshal(room)
	if err != nil {
		log.Printf("Something went wrong: %v", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(string(res))
}

func (h *RoomHandler) JoinRoom(w http.ResponseWriter, r *http.Request) {
	roomId := r.PathValue("roomId")
	room, err := room.GetRoom(roomId)
	if err != nil {
		w.Write([]byte(err.Error()))
		w.WriteHeader(http.StatusNotFound)
		return
	}

	fmt.Printf("room found with id=%s\n", room.Id)

	res, err := json.Marshal(room)
	if err != nil {
		log.Printf("Something went wrong: %v", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(string(res))
}

func (h *RoomHandler) AddPlayerToRoom(w http.ResponseWriter, r *http.Request) {
	roomId := r.PathValue("roomId")
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Fatal(fmt.Printf("unable to read request body, %s", err.Error()))
	}
	var request struct {
		PlayerId   string `json:"playerId"`
		PlayerName string `json:"playerName"`
	}
	err = json.Unmarshal(body, &request)
	if err != nil {
		log.Fatal(fmt.Printf("unable to unmarshal request %s", err.Error()))
	}
	room, err := room.GetRoom(roomId)
	if err != nil {
		w.Write([]byte(err.Error()))
		w.WriteHeader(http.StatusNotFound)
		return
	}

	err = room.AddPlayerToRoom(request.PlayerId, request.PlayerName)
	if err != nil {
		w.Write([]byte(err.Error()))
		w.WriteHeader(http.StatusLocked)
		return
	}

	res, err := json.Marshal(request)
	if err != nil {
		log.Printf("Something went wrong: %e", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(string(res))
}

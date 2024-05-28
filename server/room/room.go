package room

import (
	"errors"
	"fmt"
	"math/rand"

	"github.com/campbell-rehu/quik-be/helpers"
	"github.com/campbell-rehu/quik-be/types"
	"github.com/jaswdr/faker/v2"
)

const DefaultTimerDuration = 10

type Room struct {
	Id                 string                   `json:"id"`
	UsedLetters        map[string]bool          `json:"usedLetters"`
	Players            map[string]*types.Player `json:"-"`
	CurrentPlayer      *types.Player            `json:"currentPlayer"`
	locked             bool
	timer              *Timer
	playerOrder        []string
	currentPlayerIndex int
}

func NewRoom() *Room {
	fake := faker.New()
	return &Room{
		Id:                 fmt.Sprintf("%s-%s", fake.Lorem().Word(), fake.Lorem().Word()),
		UsedLetters:        make(map[string]bool),
		Players:            make(map[string]*types.Player),
		CurrentPlayer:      nil,
		locked:             false,
		timer:              NewTimer(),
		playerOrder:        []string{},
		currentPlayerIndex: 0,
	}
}

func (r *Room) GetCategory() string {
	difficultyIndex := rand.Intn(len(types.Difficulties))
	difficultyValue := types.Difficulties[difficultyIndex]
	categoriesForDifficulty := types.C[difficultyValue]
	return categoriesForDifficulty[rand.Intn(len(categoriesForDifficulty))]
}

func (r *Room) SetNextPlayerIndex() {
	next := r.currentPlayerIndex + 1
	if next >= len(r.Players) {
		next = 0
	}
	r.currentPlayerIndex = next
}

func (r *Room) IsLocked() bool {
	return r.locked
}

func (r *Room) LockRoom() {
	r.locked = true
}

func (r *Room) UnlockRoom() {
	if r.timer.started {
		return
	}
	r.locked = false
}

func (r *Room) AddPlayerToRoom(playerId, playerName string) error {
	if r.locked {
		err := errors.New("room is locked, new players cannot join")
		helpers.PrintError(err)
		return err
	}
	AddPlayerIdToRoomIdMapping(playerId, r.Id)
	r.playerOrder = append(r.playerOrder, playerId)
	r.Players[playerId] = &types.Player{
		Id:         playerId,
		Name:       playerName,
		IsTurn:     false,
		Eliminated: false,
		WinCount:   0,
	}
	helpers.Print("player id=%s added to room id=%s", playerId, r.Id)
	return nil
}

func (r *Room) GetPlayerCount() int {
	return len(r.Players)
}

func (r *Room) GetCurrentPlayer() *types.Player {
	currentPlayerId := r.playerOrder[r.currentPlayerIndex]
	return r.Players[currentPlayerId]
}

func (r *Room) LeaveRoom(playerId string) {
	r.removePlayerFromPlayersMap(playerId)
	r.removePlayerFromPlayerOrder(playerId)
	RemovePlayerIdToRoomIdMapping(playerId)
	if r.GetPlayerCount() == 1 {
		r.UnlockRoom()
	}
}

func (r *Room) removePlayerFromPlayersMap(playerId string) {
	if _, ok := r.Players[playerId]; ok {
		delete(r.Players, playerId)
	}
}

func (r *Room) removePlayerFromPlayerOrder(playerId string) {
	playerIndex := 0
	found := false
	for i, pid := range r.playerOrder {
		if playerId == pid {
			found = true
			playerIndex = i
		}
	}
	if found == true {
		r.playerOrder = append(r.playerOrder[:playerIndex], r.playerOrder[playerIndex+1:]...)
		if playerIndex == r.currentPlayerIndex {
			r.SetNextPlayerIndex()
		}
	}
}

func (r *Room) StartTimer(
	emitTick func(chan int, chan bool),
	emitEvent func(types.EventType, any),
) {
	r.timer.start(emitTick, r.handleTimerExpiry(emitEvent))
}

func (r *Room) handleTimerExpiry(emitEvent func(types.EventType, any)) func() {
	return func() {
		player := r.eliminateCurrentPlayer()
		r.SetNextPlayerIndex()
		type x struct {
			EliminatedPlayer *types.Player `json:"eliminatedPlayer"`
		}
		emitEvent(types.EventTypePlayerEliminated, &x{EliminatedPlayer: player})
		if r.getRemainingPlayerCount() == 1 {
			remainingPlayer := r.getRemainingPlayer()
			r.increasePlayerWinCount(remainingPlayer.Id)
			gameWinner := r.getGameWinner()
			if gameWinner == nil {
				r.endRound()
				type t struct {
					WinningPlayer *types.Player `json:"winningPlayer"`
				}
				emitEvent(types.EventTypeRoundEnded, &t{WinningPlayer: remainingPlayer})
			} else {
				r.endGame()
				type t struct {
					GameWinner    *types.Player   `json:"gameWinner"`
					UsedLetters   map[string]bool `json:"usedLetters"`
					CurrentPlayer *types.Player   `json:"currentPlayer"`
					PlayerCount   int             `json:"playerCount"`
				}
				emitEvent(types.EventTypeGameEnded, &t{
					GameWinner:    gameWinner,
					UsedLetters:   r.UsedLetters,
					CurrentPlayer: r.GetCurrentPlayer(),
					PlayerCount:   r.GetPlayerCount(),
				})
			}
		}
	}
}

func (r *Room) getRemainingPlayerCount() int {
	playerCount := r.GetPlayerCount()
	for _, player := range r.Players {
		if player.Eliminated {
			playerCount--
		}
	}
	return playerCount
}

func (r *Room) eliminateCurrentPlayer() *types.Player {
	player := r.Players[r.playerOrder[r.currentPlayerIndex]]
	r.Players[r.playerOrder[r.currentPlayerIndex]].Eliminated = true
	return player
}

func (r *Room) endRound() {
	r.ResetTimer()
	r.resetUsedLetters()
	r.resetPlayersState(false)
}

func (r *Room) resetUsedLetters() {
	r.UsedLetters = make(map[string]bool)
}

func (r *Room) resetPlayersState(endGame bool) {
	for _, player := range r.Players {
		player.Eliminated = false
		if endGame {
			player.WinCount = 0
		}
	}
}

func (r *Room) endGame() {
	r.ResetTimer()
	r.resetUsedLetters()
	r.resetPlayersState(true)
}

func (r *Room) getGameWinner() *types.Player {
	for _, player := range r.Players {
		if player.WinCount >= 3 {
			return player
		}
	}
	return nil
}

func (r *Room) increasePlayerWinCount(playerId string) {
	r.Players[playerId].WinCount++
}

func (r *Room) getRemainingPlayer() *types.Player {
	for _, player := range r.Players {
		if !player.Eliminated {
			return player
		}
	}
	return nil
}

func (r *Room) ResetTimer() {
	r.timer.reset()
}

func (r *Room) ToggleUsedLetter(letter string) {
	if val, ok := r.UsedLetters[letter]; val && ok {
		r.RemoveUsedLetter(letter)
	}
	r.UsedLetters[letter] = true
}

func (r *Room) RemoveUsedLetter(letter string) {
	if _, ok := r.UsedLetters[letter]; ok {
		delete(r.UsedLetters, letter)
	}
}

func (r *Room) SetLetterUnselectable(letter string) {
	if _, ok := r.UsedLetters[letter]; ok {
		r.UsedLetters[letter] = false
	}
}

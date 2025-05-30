package main

import (
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/campbell-rehu/quik-be/api"
	"github.com/campbell-rehu/quik-be/socket"
	"github.com/rs/cors"
)

const PORT = "9191"

func main() {
	router := http.NewServeMux()
	cors := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{
			http.MethodPost,
			http.MethodGet,
			http.MethodOptions,
		},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: false,
	})

	roomHandler := &api.RoomHandler{}
	io := socket.NewSocket()
	router.HandleFunc("POST /room", roomHandler.CreateRoom)
	router.HandleFunc("GET /room/{roomId}", roomHandler.JoinRoom)
	router.HandleFunc("POST /room/{roomId}/addPlayer", roomHandler.AddPlayerToRoom)
	router.HandleFunc("/socket.io/", io.HandleHTTP)

	fmt.Printf("Listening on port %s\n", PORT)

	go http.ListenAndServe(fmt.Sprintf(":%s", PORT), cors.Handler(router))

	io.RegisterWSHandlers()

	io.HandleWS()

	exit := make(chan struct{})
	SignalC := make(chan os.Signal, 1)

	signal.Notify(
		SignalC,
		os.Interrupt,
		syscall.SIGHUP,
		syscall.SIGINT,
		syscall.SIGTERM,
		syscall.SIGQUIT,
	)
	go func() {
		for s := range SignalC {
			switch s {
			case os.Interrupt, syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT:
				close(exit)
				return
			}
		}
	}()

	<-exit
	os.Exit(0)
}

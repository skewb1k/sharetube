package main

import (
	"fmt"
	"log"
	"net"
	"net/http"
)

func ServeHTTP(addr string) error {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", handleHealthz)

	mux.HandleFunc("POST /room", handleCreateRoom)
	mux.HandleFunc("GET /room/{roomID}", handleGetRoom)
	mux.HandleFunc("POST /room/{roomID}", handleJoinRoom)

	mux.HandleFunc("UPDATE /player", handleUpdatePlayer)

	mux.HandleFunc("POST /video", handleAddVideo)
	mux.HandleFunc("DELETE /video/{videoIdx}", handleRemoveVideo)

	mux.HandleFunc("GET /subscribe", handleSubscribe)

	srv := &http.Server{
		Handler: loggingMiddleware(corsMiddleware(mux)),
	}

	ln, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("listen: %w", err)
	}

	fullAddr := ln.Addr().String()
	log.Printf("Listening on http://%s", fullAddr)

	return srv.Serve(ln)
}

func handleHealthz(w http.ResponseWriter, r *http.Request) {
	_, _ = w.Write([]byte("Ok"))
}

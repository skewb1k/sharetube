package main

import (
	"log"
	"net/http"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", handleHealthz)

	mux.HandleFunc("POST /room", handleCreateRoom)
	mux.HandleFunc("GET /room/{roomID}", handleGetRoom)
	mux.HandleFunc("POST /room/{roomID}", handleJoinRoom)

	mux.HandleFunc("POST /video", handleAddVideo)
	mux.HandleFunc("GET /subscribe", handleSubscribe)

	srv := &http.Server{
		Addr:    "0.0.0.0:9090",
		Handler: loggingMiddleware(corsMiddleware(mux)),
	}

	log.Printf("Listening on http://%s", srv.Addr)
	log.Fatal(srv.ListenAndServe())
}

func handleHealthz(w http.ResponseWriter, r *http.Request) {
	_, _ = w.Write([]byte("Ok"))
}

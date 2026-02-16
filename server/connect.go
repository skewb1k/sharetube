package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// TODO(skewb1k): validate Origin.
		return true
	},
}

func handleConnectRoom(w http.ResponseWriter, r *http.Request) {
	roomID := r.PathValue("roomID")
	room := roomStore.GetRoom(roomID)
	if room == nil {
		http.Error(w, "Room not found", http.StatusNotFound)
		return
	}

	userIDParam := r.URL.Query().Get("uid")
	userID, err := strconv.Atoi(userIDParam)
	if err != nil {
		http.Error(w, "Invalid user ID: "+err.Error(), http.StatusBadRequest)
		return
	}

	user := room.GetUser(userID)
	if user == nil {
		http.Error(w, "User not found", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Failed to upgrade connection: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer conn.Close()

	room.Mu.Lock()
	user.Conn = conn
	room.Mu.Unlock()

	for {
		var msg any
		err := conn.ReadJSON(&msg)
		if err != nil {
			break
		}
		msgBytes, err := json.Marshal(msg)
		if err != nil {
			break
		}

		room.Mu.RLock()
		broadcast(room, conn, msgBytes)
		room.Mu.RUnlock()

		err = conn.WriteMessage(websocket.TextMessage, msgBytes)
		if err != nil {
			log.Printf("Failed to write: %s", err.Error())
			break
		}
	}

	room.Mu.Lock()
	user.Conn = nil
	room.Mu.Unlock()
}

// This function does not acquire or release the room lock.
// Callers are responsible for locking.
func broadcast(room *Room, senderConn *websocket.Conn, msg []byte) {
	for _, user := range room.Users {
		conn := user.Conn
		if conn == nil || conn == senderConn {
			continue
		}

		// TODO(skewb1k): use channel here to avoid blocking thread.
		err := conn.WriteMessage(websocket.TextMessage, msg)
		if err != nil {
			log.Printf("broadcast write error: %v", err)
			conn.Close()
		}
	}
}

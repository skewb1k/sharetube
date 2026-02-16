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

	user.SetConn(conn)
	defer user.SetConn(nil)

	for {
		var msg any
		err := conn.ReadJSON(&msg)
		if err != nil {
			break
		}
		users := room.GetUsers()

		msgBytes, err := json.Marshal(msg)
		if err != nil {
			break
		}
		broadcast(users, conn, msgBytes)
		err = conn.WriteMessage(websocket.TextMessage, msgBytes)
		if err != nil {
			log.Printf("Failed to write: %s", err.Error())
			break
		}
	}
}

func broadcast(users []*User, senderConn *websocket.Conn, msg []byte) {
	for _, user := range users {
		conn := user.GetConn()
		if conn == nil || conn == senderConn {
			continue
		}

		go func(c *websocket.Conn) {
			err := c.WriteMessage(websocket.TextMessage, msg)
			if err != nil {
				log.Printf("broadcast write error: %v", err)
				c.Close()
			}
		}(conn)
	}
}

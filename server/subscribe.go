package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// TODO(skewb1k): validate Origin.
		return true
	},
}

type NotificationTag string

const (
	NotificationTagUserJoined NotificationTag = "USER_JOINED"
	NotificationTagVideoAdded                 = "VIDEO_ADDED"
)

type Notification struct {
	Tag  NotificationTag `json:"tag"`
	Data any             `json:"data"`
}

type UserJoinedNotification struct {
	JoinedUser *User   `json:"joinedUser"`
	Users      []*User `json:"users"`
}

func handleSubscribe(w http.ResponseWriter, r *http.Request) {
	authTokenParam := r.URL.Query().Get("token")
	authToken, err := DecodeAuthToken(authTokenParam)
	if err != nil {
		http.Error(w, "Invalid auth token: "+err.Error(), http.StatusBadRequest)
		return
	}

	room := roomStore.GetRoom(authToken.RoomID)
	if room == nil {
		http.Error(w, "Room not found", http.StatusNotFound)
		return
	}

	user := room.GetUser(authToken.UserID)
	if user == nil {
		http.Error(w, "User not found", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Failed to upgrade connection: "+err.Error(), http.StatusBadRequest)
		return
	}

	room.Mu.Lock()
	user.Conn = conn
	room.Mu.Unlock()
}

// This function does not acquire or release the room lock.
// Callers are responsible for locking.
// TODO(skewb1k): rename.
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

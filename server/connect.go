package main

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{}

func handleConnectRoom(w http.ResponseWriter, r *http.Request) {
	roomID := r.PathValue("roomID")
	room := roomStore.GetRoom(roomID)
	if room == nil {
		http.Error(w, "Room not found", http.StatusNotFound)
		return
	}

	userIDCookie, err := r.Cookie(USER_ID_COOKIE)
	if err != nil {
		http.Error(w, "Missing 'st_user_id' cookie", http.StatusBadRequest)
		return
	}
	userID, err := strconv.Atoi(userIDCookie.Value)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	user := room.GetUser(userID)
	if user == nil {
		http.Error(w, "User not found", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Failed to upgrade connection"+err.Error(), http.StatusBadRequest)
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
		broadcast(room, conn, msg)

		err = conn.WriteJSON(msg)
		if err != nil {
			log.Printf("Failed to write: %s", err.Error())
			break
		}
	}
}

func broadcast(room *Room, senderConn *websocket.Conn, msg any) {
	users := room.GetUsers()
	for _, u := range users {
		conn := u.GetConn()
		if conn == nil || conn == senderConn {
			continue
		}

		go func(c *websocket.Conn) {
			if err := c.WriteJSON(msg); err != nil {
				log.Printf("broadcast write error: %v", err)
				c.Close()
			}
		}(conn)
	}
}

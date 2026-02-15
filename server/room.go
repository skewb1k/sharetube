package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
)

var roomStore = NewRoomStore()

func newRoomID() string {
	b := make([]byte, 4)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func handleCreateRoom(w http.ResponseWriter, r *http.Request) {
	roomID := newRoomID()

	room := &Room{}
	roomStore.AddRoom(roomID, room)

	w.WriteHeader(http.StatusCreated)
	_, _ = io.WriteString(w, roomID)
}

type joinRoomResp struct {
	UserID int   `json:"user_id"`
	Room   *Room `json:"room"`
}

func handleJoinRoom(w http.ResponseWriter, r *http.Request) {
	roomID := r.PathValue("roomID")
	room := roomStore.GetRoom(roomID)
	if room == nil {
		http.Error(w, "Room not found", http.StatusNotFound)
		return
	}

	username := r.URL.Query().Get("username")
	if username == "" {
		// TODO(skewb1k): generate unique username.
		username = "User1"
	}
	user := &User{
		Name: username,
	}
	userID := room.AddUser(user)

	resp := joinRoomResp{
		UserID: userID,
		Room:   room,
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}

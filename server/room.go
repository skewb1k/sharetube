package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"time"
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

const USER_ID_COOKIE = "st_user_id"

func handleJoinRoom(w http.ResponseWriter, r *http.Request) {
	roomID := r.PathValue("roomID")
	room := roomStore.GetRoom(roomID)
	if room == nil {
		http.Error(w, "Room not found", http.StatusNotFound)
		return
	}

	username := r.URL.Query().Get("username")
	if username == "" {
		username = "User1"
	}
	user := &User{
		Name: username,
	}
	userID := room.AddUser(user)

	userCookie := &http.Cookie{
		Name:    USER_ID_COOKIE,
		Value:   strconv.Itoa(userID),
		Expires: time.Now().Add(90 * 24 * time.Hour),
	}
	http.SetCookie(w, userCookie)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(room)
}

package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"strconv"
)

var roomStore = NewRoomStore()

func newRoomID() string {
	b := make([]byte, 4)
	// crypto/rand.Read() never returns an error.
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

func handleGetRoom(w http.ResponseWriter, r *http.Request) {
	roomID := r.PathValue("roomID")
	room := roomStore.GetRoom(roomID)
	if room == nil {
		http.Error(w, "Room not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(room)
	if err != nil {
		panic(err)
	}
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

	room.Mu.RLock()

	notification := &Notification{
		Tag: NotificationTagUserJoined,
		Data: UserJoinedNotification{
			JoinedUser: user,
			Users:      room.Users,
		},
	}
	notificationBytes, err := json.Marshal(notification)
	if err != nil {
		panic(err)
	}
	broadcast(room, nil, notificationBytes)
	room.Mu.RUnlock()

	room.Mu.Lock()
	userID := len(room.Users)
	room.Users = append(room.Users, user)
	room.Mu.Unlock()

	_, _ = io.WriteString(w, strconv.Itoa(userID))
}

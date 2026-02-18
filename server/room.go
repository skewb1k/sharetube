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
	// crypto/rand.Read() never returns an error.
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func handleCreateRoom(w http.ResponseWriter, r *http.Request) {
	roomID := newRoomID()

	room := &Room{
		Playlist: Playlist{
			// Initialize slice so its encoded as [] in JSON.
			Videos: make([]*Video, 0),
		},
	}
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

	// TODO(skewb1k): use request body instead.
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
	// TODO(skewb1k): do not block handler by broadcasting.
	broadcast(room, nil, notificationBytes)
	room.Mu.RUnlock()

	room.Mu.Lock()
	userID := len(room.Users)
	room.Users = append(room.Users, user)
	room.Mu.Unlock()

	authToken := AuthToken{
		RoomID: roomID,
		UserID: userID,
	}
	_, _ = io.WriteString(w, authToken.String())
}

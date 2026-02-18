package main

import (
	"encoding/json"
	"net/http"
)

type AddVideoRequest struct {
	YTID string `json:"ytId"`
}

func handleAddVideo(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	authToken, err := DecodeAuthToken(authHeader)
	if err != nil {
		http.Error(w, "Invalid auth token: "+err.Error(), http.StatusBadRequest)
		return
	}

	room := roomStore.GetRoom(authToken.RoomID)
	if room == nil {
		http.Error(w, "Room not found", http.StatusBadRequest)
		return
	}

	user := room.GetUser(authToken.UserID)
	if user == nil {
		http.Error(w, "User not found", http.StatusBadRequest)
		return
	}

	var req AddVideoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	room.Mu.Lock()

	video := &Video{
		YTID: req.YTID,
		// TODO(skewb1k): fetch other info about video.
	}
	if room.Playlist.CurrentVideo == nil {
		room.Playlist.CurrentVideo = video
	} else {
		room.Playlist.Videos = append(room.Playlist.Videos, video)
	}

	notification := Notification{
		Tag:  NotificationTagVideoAdded,
		Data: &room.Playlist,
	}
	notificationMsg, err := json.Marshal(notification)
	if err != nil {
		panic(err)
	}

	room.Mu.Unlock()

	room.Mu.RLock()
	broadcast(room, nil, notificationMsg)
	room.Mu.RUnlock()
}

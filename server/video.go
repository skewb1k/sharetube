package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"sharetube-server/ytinfo"
)

type AddVideoRequest struct {
	YTID string `json:"ytId"`
}

func handleAddVideo(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	authToken, err := DecodeAuthToken(authHeader)
	if err != nil {
		http.Error(w, fmt.Sprintf("Invalid auth token: %s", err), http.StatusBadRequest)
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
		http.Error(w, fmt.Sprintf("Invalid request body: %s", err), http.StatusBadRequest)
		return
	}

	room.Mu.Lock()

	videoInfo, err := ytinfo.FetchVideoInfo(req.YTID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to fetch video info: %s", err), http.StatusBadRequest)
		return
	}
	video := &Video{
		YTID:         req.YTID,
		Title:        videoInfo.Title,
		AuthorName:   videoInfo.AuthorName,
		ThumbnailURL: videoInfo.ThumbnailURL,
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

func handleRemoveVideo(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	authToken, err := DecodeAuthToken(authHeader)
	if err != nil {
		http.Error(w, fmt.Sprintf("Invalid auth token: %s", err), http.StatusBadRequest)
		return
	}

	room := roomStore.GetRoom(authToken.RoomID)
	if room == nil {
		http.Error(w, "Room not found", http.StatusBadRequest)
		return
	}

	videoID, err := strconv.Atoi(r.PathValue("videoID"))
	if err != nil {
		http.Error(w, fmt.Sprintf("Invalid video id: %s", err), http.StatusBadRequest)
		return
	}

	room.Mu.Lock()

	if videoID < 0 || videoID >= len(room.Playlist.Videos) {
		room.Mu.Unlock()
		http.Error(w, "Invalid video id: index out of range", http.StatusBadRequest)
		return
	}

	room.Playlist.Videos = append(room.Playlist.Videos[:videoID], room.Playlist.Videos[videoID+1:]...)

	notification := Notification{
		Tag:  NotificationTagVideoRemoved,
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

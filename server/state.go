package main

import (
	"sync"

	"github.com/gorilla/websocket"
)

type User struct {
	Name string          `json:"name"`
	Conn *websocket.Conn `json:"-"`
}

type Room struct {
	Mu    sync.RWMutex
	Users []*User `json:"users"`
}

func (r *Room) GetUser(userID int) *User {
	r.Mu.RLock()
	defer r.Mu.RUnlock()
	return r.Users[userID]
}

type RoomStore struct {
	mu    sync.RWMutex
	rooms map[string]*Room
}

func NewRoomStore() *RoomStore {
	return &RoomStore{
		mu:    sync.RWMutex{},
		rooms: make(map[string]*Room),
	}
}

func (s *RoomStore) AddRoom(roomID string, room *Room) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.rooms[roomID] = room
}

func (s *RoomStore) GetRoom(roomID string) *Room {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.rooms[roomID]
}

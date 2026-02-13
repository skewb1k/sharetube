package main

import (
	"sync"
)

type User struct {
	Name string `json:"name"`
}

type Room struct {
	mu    sync.RWMutex
	Users []*User `json:"users"`
}

func (r *Room) AddUser(user *User) int {
	r.mu.Lock()
	defer r.mu.Unlock()

	idx := len(r.Users)
	r.Users = append(r.Users, user)
	return idx
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

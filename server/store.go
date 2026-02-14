package main

import (
	"sync"

	"github.com/gorilla/websocket"
)

type User struct {
	mu   sync.RWMutex
	Name string          `json:"name"`
	Conn *websocket.Conn `json:"-"`
}

func (u *User) SetConn(conn *websocket.Conn) {
	u.mu.Lock()
	defer u.mu.Unlock()
	u.Conn = conn
}

func (u *User) GetConn() *websocket.Conn {
	u.mu.RLock()
	defer u.mu.RUnlock()
	return u.Conn
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

func (r *Room) GetUser(userID int) *User {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.Users[userID]
}

func (r *Room) GetUsers() []*User {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.Users
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

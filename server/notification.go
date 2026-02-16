package main

type NotificationTag uint8

const (
	NotificationTagUserJoined NotificationTag = iota
)

type Notification struct {
	Tag  NotificationTag `json:"tag"`
	Data any             `json:"data"`
}

type UserJoinedNotification struct {
	JoinedUser *User   `json:"joinedUser"`
	Users      []*User `json:"users"`
}

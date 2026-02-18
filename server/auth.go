package main

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
)

type AuthToken struct {
	RoomID string
	UserID int
}

func (at AuthToken) String() string {
	return fmt.Sprintf("%s,%d", at.RoomID, at.UserID)
}

var ErrAuthTokenInvalid = errors.New("invalid format")

func DecodeAuthToken(s string) (*AuthToken, error) {
	parts := strings.SplitN(s, ",", 2)
	if len(parts) != 2 {
		return nil, ErrAuthTokenInvalid
	}
	roomID := parts[0]
	if roomID == "" {
		return nil, ErrAuthTokenInvalid
	}
	userID, err := strconv.Atoi(parts[1])
	if err != nil {
		return nil, err
	}
	return &AuthToken{
		RoomID: roomID,
		UserID: userID,
	}, nil
}

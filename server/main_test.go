package main

import (
	"fmt"
	"io"
	"maps"
	"net/http"
	"testing"
	"time"

	"github.com/gorilla/websocket"
)

func TestMain(m *testing.M) {
	go main() // Start the server in-process
	m.Run()
}

// TODO(skewb1k): choose the random available port instead.
const HOST = "localhost:9090"

func TestConnect(t *testing.T) {
	var client http.Client

	roomID, err := createRoom(&client)
	if err != nil {
		t.Fatalf("createRoom: %v", err)
	}

	err = getRoom(&client, roomID)
	if err != nil {
		t.Fatalf("getRoom: %v", err)
	}

	authToken1, err := joinRoom(&client, roomID)
	if err != nil {
		t.Fatalf("joinRoom user1: %v", err)
	}

	conn1, err := subscribe(authToken1)
	if err != nil {
		t.Fatalf("subscribe user1: %v", err)
	}
	defer conn1.Close()

	authToken2, err := joinRoom(&client, roomID)
	if err != nil {
		t.Fatalf("joinRoom user2: %v", err)
	}

	conn2, err := subscribe(authToken2)
	if err != nil {
		t.Fatalf("subscribe user2: %v", err)
	}
	defer conn2.Close()

	recvCh := make(chan any, 1)
	errCh := make(chan error, 1)

	go func() {
		var v any
		if err := conn2.ReadJSON(&v); err != nil {
			errCh <- err
			return
		}
		recvCh <- v
	}()

	msg := map[string]any{"data": "123"}
	if err := conn1.WriteJSON(msg); err != nil {
		t.Fatalf("write json on conn1: %v", err)
	}

	select {
	case got := <-recvCh:
		m, ok := got.(map[string]any)
		if !ok {
			t.Fatalf("received message has unexpected type: %T", got)
		}
		if !maps.Equal(msg, m) {
			t.Fatalf("unexpected message data: %#v", m)
		}
	case err := <-errCh:
		t.Fatalf("conn2 read failed: %v", err)
	case <-time.After(2 * time.Second):
		t.Fatalf("timed out waiting for message on conn2")
	}
}

func createRoom(client *http.Client) (string, error) {
	url := "http://" + HOST + "/room"
	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		return "", fmt.Errorf("request build: %w", err)
	}
	res, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("request do: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusCreated {
		return "", fmt.Errorf("unexpected status: %s", res.Status)
	}

	roomIDBytes, err := io.ReadAll(res.Body)
	if err != nil {
		return "", fmt.Errorf("read body: %w", err)
	}
	return string(roomIDBytes), nil
}

func joinRoom(client *http.Client, roomID string) (string, error) {
	url := "http://" + HOST + "/room/" + roomID
	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		return "", fmt.Errorf("request build: %w", err)
	}
	res, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("request do: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return "", fmt.Errorf("unexpected status: %s", res.Status)
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return "", fmt.Errorf("read body: %w", err)
	}
	authToken := string(body)
	return authToken, nil
}

func subscribe(authToken string) (*websocket.Conn, error) {
	wsURL := fmt.Sprintf("ws://%s/subscribe?token=%s", HOST, authToken)
	dialer := websocket.Dialer{}
	conn, _, err := dialer.Dial(wsURL, nil)
	if err != nil {
		return nil, fmt.Errorf("websocket dial failed: %w", err)
	}
	return conn, nil
}

func getRoom(client *http.Client, roomID string) error {
	url := "http://" + HOST + "/room/" + roomID
	res, err := client.Get(url)
	if err != nil {
		return fmt.Errorf("get: %w", err)
	}
	defer res.Body.Close()

	// TODO(skewb1k): assert res.Body.

	if res.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status: %s", res.Status)
	}

	return nil
}

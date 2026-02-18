// Package ytinfo implements fetching of public data from YouTube without
// requiring authorization.
package ytinfo

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
)

var (
	ErrNotFound     = errors.New("not found")
	ErrAccessDenied = errors.New("access denied")
)

// TODO(skewb1k): support more fields.
type VideoInfo struct {
	Title        string `json:"title"`
	AuthorName   string `json:"author_name"`
	ThumbnailURL string `json:"thumbnail_url"`
}

func FetchVideoInfo(videoID string) (*VideoInfo, error) {
	url := fmt.Sprintf("https://youtube.com/watch?v=%s", videoID)
	videoInfo, err := fetchOEmbed(url)
	if err != nil {
		// TODO(skewb1k): try to parse page HTML if err == ErrVideoNotAccessable
		return nil, err
	}
	return videoInfo, nil
}

func fetchOEmbed(videoURL string) (*VideoInfo, error) {
	url := fmt.Sprintf("https://youtube.com/oembed?url=%s", videoURL)
	response, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	switch response.StatusCode {
	case http.StatusOK:
		var videoInfo VideoInfo
		err = json.NewDecoder(response.Body).Decode(&videoInfo)
		if err != nil {
			return nil, err
		}
		return &videoInfo, err

	case http.StatusBadRequest:
		return nil, ErrNotFound
	case http.StatusUnauthorized:
		return nil, ErrAccessDenied
	default:
		return nil, fmt.Errorf("unexpected status code: %d", response.StatusCode)
	}
}

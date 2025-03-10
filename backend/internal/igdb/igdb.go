package igdb

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
)

type Game struct {
	Name    string `json:"name"`
	Genre   string `json:"genre"`
	Summary string `json:"summary"`
	Cover   struct {
		URL string `json:"url"`
	} `json:"cover"`
}

func GetIGDBData() ([]Game, error) {
	url := "https://api.igdb.com/v4/games"
	clientID := os.Getenv("IGDB_CLIENT_ID")
	accessToken := os.Getenv("IGDB_ACCESS_TOKEN")

	body := []byte(`fields name, genre, summary, cover; limit 10;`)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Client-ID", clientID)
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()

	bodyResp, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %v", err)
	}

	var games []Game
	err = json.Unmarshal(bodyResp, &games)
	if err != nil {
		return nil, fmt.Errorf("failed to parse JSON: %v", err)
	}

	return games, nil
}

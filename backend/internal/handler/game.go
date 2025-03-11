package handler

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/Henry-Sarabia/apicalypse"
	"github.com/gofiber/fiber/v2"
)

// Replace these with your actual IGDB credentials
const (
	clientID     = "zil3zgsnlgkl7fp4n1rltckjcbwpqd"
	accessToken  = "a8py6w4eo7n4ir55a8f4rte9hoinmy"
	igdbEndpoint = "https://api.igdb.com/v4/games"
)

// GetGamesHandler fetches video game data from IGDB using Apicalypse
func GetGamesHandler(c *fiber.Ctx) error {
	// Define query options using Apicalypse
	opts := []apicalypse.Option{
		apicalypse.Fields("id", "name", "genres.name", "summary", "cover.url"), // Use Fields instead of Field
		apicalypse.Limit(10),
	}

	// Create the request using Apicalypse
	req, err := apicalypse.NewRequest(http.MethodPost, igdbEndpoint, opts...)
	if err != nil {
		log.Println("Error creating request:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create request"})
	}

	// Set required headers
	req.Header.Add("Client-ID", clientID)
	req.Header.Add("Authorization", "Bearer "+accessToken)
	req.Header.Add("Accept", "application/json")

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Error sending request:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to send request to IGDB"})
	}
	defer resp.Body.Close()

	// Read response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println("Error reading response:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to read IGDB response"})
	}

	// Debugging: Print the response body
	log.Println("IGDB Response:", string(body))

	// Parse the JSON response
	var games []map[string]interface{}
	if err := json.Unmarshal(body, &games); err != nil {
		log.Println("Error decoding JSON:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to decode IGDB response"})
	}

	// Update cover URLs to include https:// if they start with //
	for i, game := range games {
		if cover, exists := game["cover"].(map[string]interface{}); exists {
			if url, ok := cover["url"].(string); ok {
				// Check if the URL starts with //, and prepend https: if necessary
				if len(url) > 0 && url[0] == '/' {
					cover["url"] = "https:" + url
				}
			}
		}
		games[i] = game
	}

	// Return the games data
	return c.JSON(games)
}

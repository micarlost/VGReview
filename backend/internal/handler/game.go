package handler

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"        
	"strings"     
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
func SearchGamesWithLimitOffset(c *fiber.Ctx) error {
	// Capture query parameters
	query := c.Query("q")
	limit := c.QueryInt("limit", 10)   // default 10 if not provided
	offset := c.QueryInt("offset", 0)   // default 0 if not provided

	if query == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing search query"})
	}

	// Manually build the body as a string
	requestBody := `
		search "` + query + `";
		fields id, name, genres.name, summary, cover.url, version_parent;
		where version_parent = null;
		limit ` + strconv.Itoa(limit) + `;
		offset ` + strconv.Itoa(offset) + `;
	`

	// Build a POST request manually
	req, err := http.NewRequest(http.MethodPost, igdbEndpoint, strings.NewReader(requestBody))
	if err != nil {
		log.Println("Error creating request:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create IGDB request"})
	}

	// Add required headers
	req.Header.Add("Client-ID", clientID)
	req.Header.Add("Authorization", "Bearer "+accessToken)
	req.Header.Add("Accept", "application/json")

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Error sending request:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to send IGDB request"})
	}
	defer resp.Body.Close()

	// Read response
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println("Error reading IGDB response:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to read IGDB response"})
	}

	// Debugging: Print response
	log.Println("IGDB Response:", string(body))

	// Decode JSON
	var games []map[string]interface{}
	if err := json.Unmarshal(body, &games); err != nil {
		log.Println("Error decoding IGDB JSON:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to decode IGDB response"})
	}

	// Fix cover URLs
	for i, game := range games {
		if cover, exists := game["cover"].(map[string]interface{}); exists {
			if url, ok := cover["url"].(string); ok {
				if len(url) > 0 && url[0] == '/' {
					cover["url"] = "https:" + url
				}
			}
		}
		games[i] = game
	}

	return c.JSON(games)
}
func GetGameData(c *fiber.Ctx) error {
	// Get the game ID from the URL
	gameID := c.Params("id")
	if gameID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing game ID"})
	}

	// Build the IGDB request body
	requestBody := `
		fields age_ratings, cover.url, dlcs, first_release_date, game_type, genres.name, involved_companies.company.name, 
		name, parent_game, platforms.name, player_perspectives, rating, rating_count, screenshots.url, 
		slug, standalone_expansions, status, storyline, summary, tags, themes, total_rating, total_rating_count, url, videos.video_id;
		where id = ` + gameID + `;
		limit 1;
	`

	// Create the HTTP request
	req, err := http.NewRequest(http.MethodPost, igdbEndpoint, strings.NewReader(requestBody))
	if err != nil {
		log.Println("Error creating IGDB request:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create IGDB request"})
	}

	// Set required headers
	req.Header.Add("Client-ID", clientID)
	req.Header.Add("Authorization", "Bearer "+accessToken)
	req.Header.Add("Accept", "application/json")

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Error sending IGDB request:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to send IGDB request"})
	}
	defer resp.Body.Close()

	// Read response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println("Error reading IGDB response:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to read IGDB response"})
	}

	// Debugging (optional)
	log.Println("IGDB Detailed Game Response:", string(body))

	// Parse JSON
	var games []map[string]interface{}
	if err := json.Unmarshal(body, &games); err != nil {
		log.Println("Error decoding IGDB JSON:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to decode IGDB response"})
	}

	if len(games) == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Game not found"})
	}

	// Fix image URLs if needed (optional)
	if cover, exists := games[0]["cover"].(map[string]interface{}); exists {
		if url, ok := cover["url"].(string); ok && strings.HasPrefix(url, "//") {
			cover["url"] = "https:" + url
		}
	}
	if screenshots, exists := games[0]["screenshots"].([]interface{}); exists {
		for _, shot := range screenshots {
			if shotMap, ok := shot.(map[string]interface{}); ok {
				if url, ok := shotMap["url"].(string); ok && strings.HasPrefix(url, "//") {
					shotMap["url"] = "https:" + url
				}
			}
		}
	}

	// Send the first (and only) game object back
	return c.JSON(games[0])
}


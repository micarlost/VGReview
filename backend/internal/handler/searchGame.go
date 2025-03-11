package handler

import "github.com/gofiber/fiber/v2"

// SearchGamesHandler handles searching for games based on the query parameter
func SearchGamesHandler(c *fiber.Ctx) error {
	query := c.Query("query") // Get query parameter from the URL
	if query == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Query parameter is required"})
	}

	// Implement your search logic here (e.g., query IGDB API or your database)
	// For now, let's simulate returning a list of games based on the query.

	// Example mock data for search result
	mockSearchResults := []map[string]interface{}{
		{"id": 1, "name": "Game 1", "summary": "An action-packed game"},
		{"id": 2, "name": "Game 2", "summary": "A thrilling RPG adventure"},
	}

	// Return search results as JSON
	return c.JSON(mockSearchResults)
}

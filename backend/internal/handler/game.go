package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/micarlost/VGReview/backend/internal/igdb"
)

// GetGamesHandler handles the /games route
func GetGamesHandler(c *fiber.Ctx) error {
	// Fetch the games from IGDB
	games, err := igdb.GetIGDBData()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Return the games as JSON
	return c.JSON(games)
}

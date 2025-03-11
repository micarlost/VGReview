package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/micarlost/VGReview/backend/configs/database"
	"github.com/micarlost/VGReview/backend/internal/entity"
)

// CreateGame creates a new game and adds it to the database
func CreateGame(c *fiber.Ctx) error {
	var data map[string]string

	// Parse the body of the request into the data map
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid input"})
	}

	// Validate input (you can add more validations here)
	if data["title"] == "" || data["description"] == "" || data["image_location"] == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Title, description, and image location are required"})
	}

	// Create a new game entity
	game := entity.Game{
		Title:         data["title"],
		ImageLocation: data["image_location"],
		Description:   data["description"],
	}

	// Add game to the database
	if err := database.DB.Create(&game).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": err.Error()})
	}

	return c.JSON(fiber.Map{
		"message": "Game created successfully",
		"game":    game,
	})
}

package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/micarlost/VGReview/backend/configs/database"
	"github.com/micarlost/VGReview/backend/internal/entity"
)

// Delete function fully delete a user account from the database
func AllAccounts(c *fiber.Ctx) error {
	var users []entity.Account

	// Query the database to get all users
	if err := database.DB.Find(&users).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Error fetching users"})
	}

	// Return the users as JSON
	return c.JSON(fiber.Map{
		"users": users,
	})
}

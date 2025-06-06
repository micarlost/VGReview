package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/micarlost/VGReview/backend/configs/database"
	"github.com/micarlost/VGReview/backend/internal/entity"
	"github.com/micarlost/VGReview/backend/internal/utils"
)

// User function retrieves user information based on user_id from the URL
func User(c *fiber.Ctx) error {
	userID := c.Params("user_id")

	var user entity.Account

	// Preload FavoriteGames when fetching the user
	if err := database.DB.Preload("FavoriteGames").Preload("PlayedGames").Preload("RatedGames").Where("id = ?", userID).First(&user).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	decryptedUsername, err := utils.Decrypt(user.Username)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Error decrypting username"})
	}

	return c.JSON(fiber.Map{
		"message": "Login successful",
		"user": fiber.Map{
			"username": decryptedUsername,
			"email":    user.Email,
			"id":       user.ID,
			"bio":      user.Bio,
			"profile_pic": user.ProfilePic,
			"favorite_games": user.FavoriteGames,
			"played_games": user.PlayedGames,
			"rated_games": user.RatedGames,
			"following": user.Following,
		},
	})
}

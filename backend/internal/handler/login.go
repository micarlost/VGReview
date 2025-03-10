package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/micarlost/VGReview/backend/configs/database"
	"github.com/micarlost/VGReview/backend/internal/entity"
	"github.com/micarlost/VGReview/backend/internal/utils"
)

// Login auths a user by checking email and password.

func Login(c *fiber.Ctx) error {

	var data entity.Login

	// Parse the request body
	if err := c.BodyParser(&data); err != nil {

		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid input"})
	}

	var user entity.Account
	if err := database.DB.Where("email = ?", data.Email).First(&user).Error; err != nil {
		// Email not found
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Incorrect email"})
	}

	// Check if the password matches
	if err := utils.CheckPasswordHash(data.Password, user.Password); err != nil {
		// Password doesn't match
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Incorrect password"})
	}
	// Successful login
	token, err := utils.GenerateJWT(user.Email)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Could not generate token"})
	}

	return c.JSON(fiber.Map{

		"message": "Login successful",
		"token":   token,
	})
}

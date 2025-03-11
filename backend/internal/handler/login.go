package handler

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/micarlost/VGReview/backend/configs/database"
	"github.com/micarlost/VGReview/backend/internal/entity"
	"github.com/micarlost/VGReview/backend/internal/utils"
)

// Login auths a user by checking email and password.

func Login(c *fiber.Ctx) error {
	var data entity.Login

	if err := c.BodyParser(&data); err != nil {

		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid input"})
	}

	var user entity.Account

	// Check if email exist
	if err := database.DB.Where("email = ?", data.Email).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "There is no account with this email. Please register."})
	}

	// Check if the password matches
	if err := utils.CheckPasswordHash(data.Password, user.Password); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"message": "Incorrect password"})
	}

	// Generate token upon successful login
	token, err := utils.GenerateJWT(user.Email)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Could not generate token"})
	}

	if user.ID == 0 {
		log.Printf("User ID is not set for user with email: %s", data.Email)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "User ID is missing"})
	}

	fmt.Println(user)
	return c.JSON(fiber.Map{
		"message": "Login successful",
		"token":   token,
		"user":    user,
	})
}

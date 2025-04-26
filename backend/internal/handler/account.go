package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/micarlost/VGReview/backend/configs/database"
	"github.com/micarlost/VGReview/backend/internal/entity"
	"fmt"
    "os"
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
func UpdateProfilePic(c *fiber.Ctx) error {
    userID := c.Params("user_id")
    var user entity.Account

    // Check if the user exists
    if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
    }

    // Get the uploaded file
    file, err := c.FormFile("profile_pic")
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No file uploaded"})
    }

    // Create a directory to store profile pictures if it doesn't exist
    if err := os.MkdirAll("./uploads/profile_pics/", 0755); err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create directory"})
    }

    // Save the file
    filePath := fmt.Sprintf("./uploads/profile_pics/%d_%s", user.ID, file.Filename)
    if err := c.SaveFile(file, filePath); err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save file"})
    }

    // Update the user profile with the file path
    user.ProfilePic = filePath
    if err := database.DB.Save(&user).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update user profile"})
    }

    return c.JSON(fiber.Map{
        "message": "Profile picture updated successfully",
        "profile_pic": filePath,
    })
	
}

func UpdateProfileDescription(c *fiber.Ctx) error {
	userID := c.Params("user_id")
	var user entity.Account

	// Check if the user exists
	if err := database.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	// Parse request body
	var body struct {
		Bio string `json:"bio"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Update and save
	user.Bio = body.Bio
	if err := database.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update profile bio"})
	}

	return c.JSON(fiber.Map{
		"message": "Profile description updated successfully",
		"bio":     user.Bio,
	})
}
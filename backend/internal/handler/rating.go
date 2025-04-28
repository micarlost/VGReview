package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/micarlost/VGReview/backend/configs/database"
	"github.com/micarlost/VGReview/backend/internal/entity"
	"gorm.io/gorm"
	"strconv"
)

func UpdateRating(c *fiber.Ctx) error {
	userIDStr := c.Params("user_id")
	gameIDStr := c.Params("game_id")

	userID, err := strconv.ParseUint(userIDStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}
	gameID, err := strconv.ParseUint(gameIDStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid game ID"})
	}

	var body struct {
		Rating uint `json:"rating"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	if body.Rating > 5 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Rating must be between 0 and 5"})
	}

	var rated entity.Rated
	result := database.DB.Where("account_id = ? AND game_id = ?", uint(userID), uint(gameID)).First(&rated)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			// If not found, create a new rating
			newRated := entity.Rated{
				AccountID: uint(userID),
				GameID:    uint(gameID),
				Rating:    body.Rating,
			}
			if err := database.DB.Create(&newRated).Error; err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create rating"})
			}
			return c.JSON(fiber.Map{"message": "Rating created successfully"})
		}
		// Other DB errors
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	// If found, update existing rating
	rated.Rating = body.Rating
	if err := database.DB.Save(&rated).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update rating"})
	}

	return c.JSON(fiber.Map{"message": "Rating updated successfully"})
}
func GetRating(c *fiber.Ctx) error {
	userIDStr := c.Params("user_id")
	gameIDStr := c.Params("game_id")

	userID, err := strconv.ParseUint(userIDStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}
	gameID, err := strconv.ParseUint(gameIDStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid game ID"})
	}

	var rated entity.Rated
	result := database.DB.Where("account_id = ? AND game_id = ?", uint(userID), uint(gameID)).First(&rated)

	if result.Error != nil {
		// If no rating found, just return 0 (or null/empty)
		return c.JSON(fiber.Map{"rating": 0})
	}

	return c.JSON(fiber.Map{
		"rating": rated.Rating,
	})
}

func DeleteRating(c *fiber.Ctx) error {
	userIDStr := c.Params("user_id")
	gameIDStr := c.Params("game_id")

	userID, err := strconv.ParseUint(userIDStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}
	gameID, err := strconv.ParseUint(gameIDStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid game ID"})
	}

	var rated entity.Rated
	result := database.DB.Where("account_id = ? AND game_id = ?", uint(userID), uint(gameID)).First(&rated)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Rating not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	if err := database.DB.Delete(&rated).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete rating"})
	}

	return c.JSON(fiber.Map{"message": "Rating deleted successfully"})
}

func AddRating(c *fiber.Ctx) error {
	userIDStr := c.Params("user_id")
	gameIDStr := c.Params("game_id")

	userID, err := strconv.ParseUint(userIDStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}
	gameID, err := strconv.ParseUint(gameIDStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid game ID"})
	}

	var body struct {
		Rating uint `json:"rating"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if body.Rating > 5 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Rating must be between 0 and 5"})
	}

	// Check if already rated
	var existing entity.Rated
	result := database.DB.Where("account_id = ? AND game_id = ?", uint(userID), uint(gameID)).First(&existing)

	if result.Error == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Rating already exists"})
	}

	if result.Error != nil && result.Error != gorm.ErrRecordNotFound {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
	}

	// Create new rating
	newRated := entity.Rated{
		AccountID: uint(userID),
		GameID:    uint(gameID),
		Rating:    body.Rating,
	}

	if err := database.DB.Create(&newRated).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create rating"})
	}

	return c.JSON(fiber.Map{"message": "Rating created successfully"})
}


// ListRatedGames lists all rated games for a user
func ListRatedGames(c *fiber.Ctx) error {
    userIDStr := c.Params("user_id")
    userID, err := strconv.ParseUint(userIDStr, 10, 64)
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
    }

    var ratedGames []entity.Rated
    result := database.DB.Where("account_id = ?", uint(userID)).Find(&ratedGames)
    if result.Error != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
    }

    // Format the output
    ratings := make([]fiber.Map, len(ratedGames))
    for i, rated := range ratedGames {
        ratings[i] = fiber.Map{
            "game_id": rated.GameID,
            "rating":  rated.Rating,
        }
    }

    return c.JSON(fiber.Map{
        "ratings": ratings,
    })
}

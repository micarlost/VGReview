package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/micarlost/VGReview/backend/configs/database"
	"github.com/micarlost/VGReview/backend/internal/entity"
)

// CreateReview handles the creation of a new review
func CreateReview(c *fiber.Ctx) error {
	var review entity.Review

	// Parse the request body into the Review struct
	if err := c.BodyParser(&review); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Validate content and rating
	if review.Content == "" || review.Rating < 1 || review.Rating > 10 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing or invalid content/rating"})
	}

	// Save the review to the database
	if err := database.DB.Create(&review).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create review"})
	}

	// Return the created review
	return c.Status(fiber.StatusCreated).JSON(review)
}

// UpdateReview handles updating an existing review
func UpdateReview(c *fiber.Ctx) error {
	reviewID := c.Params("id")
	var review entity.Review

	// Fetch the review by ID
	if err := database.DB.First(&review, "id = ?", reviewID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Review not found"})
	}

	// Define the structure for the update request
	var updateData struct {
		Content string `json:"content"`
		Rating  int    `json:"rating"`
	}

	// Parse the update data from the request body
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Update review fields based on provided data
	if updateData.Content != "" {
		review.Content = updateData.Content
	}
	if updateData.Rating >= 1 && updateData.Rating <= 10 {
		review.Rating = updateData.Rating
	}

	// Save the updated review to the database
	if err := database.DB.Save(&review).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update review"})
	}

	// Return the updated review
	return c.JSON(review)
}

// DeleteReview deletes a review by ID
func DeleteReview(c *fiber.Ctx) error {
	reviewID := c.Params("id")
	var review entity.Review

	// Fetch the review by ID
	if err := database.DB.First(&review, "id = ?", reviewID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Review not found"})
	}

	// Delete the review from the database
	if err := database.DB.Delete(&review).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete review"})
	}

	// Return a success message
	return c.JSON(fiber.Map{"message": "Review deleted successfully"})
}

// GetReviewsByGameID returns all reviews for a specific game
// ✅ Get all reviews by a specific account ID
func GetReviewsByAccountID(c *fiber.Ctx) error {
	accountID := c.Params("account_id")
	if accountID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Account ID is required"})
	}

	var reviews []entity.Review
	if err := database.DB.Preload("Account").Where("account_id = ?", accountID).Find(&reviews).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch reviews"})
	}

	response := make([]fiber.Map, 0)
	for _, review := range reviews {
		accountData := fiber.Map{
			"id":         review.Account.ID,
			"username":   review.Account.Username,
			"profile_pic": review.Account.ProfilePic,
		}

		response = append(response, fiber.Map{
			"id":         review.ID,
			"content":    review.Content,
			"rating":     review.Rating,
			"created_at": review.CreatedAt.Format("2006-01-02T15:04:05Z"),
			"game_id":    review.GameID,
			"account_id": review.AccountID,
			"account":    accountData,
		})
	}

	return c.JSON(response)
}


// ✅ Get all reviews by a specific game ID
func GetReviewsByGameID(c *fiber.Ctx) error {
	gameID := c.Params("game_id")
	if gameID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Game ID is required"})
	}

	var reviews []entity.Review
	if err := database.DB.Preload("Account").Where("game_id = ?", gameID).Find(&reviews).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch reviews"})
	}

	response := make([]fiber.Map, 0)
	for _, review := range reviews {
		response = append(response, fiber.Map{
			"id":         review.ID,
			"content":    review.Content,
			"rating":     review.Rating,
			"created_at": review.CreatedAt.Format("2006-01-02T15:04:05Z"),
			"game_id":    review.GameID,
			"account_id": review.AccountID,
			"account": func() interface{} {
				if review.Account.ID == 0 {
					return nil
				}
				return fiber.Map{
					"id":       review.Account.ID,
					"username": review.Account.Username,
					"profile_pic":review.Account.ProfilePic,
				}
			}(),
		})
	}

	return c.JSON(response)
}

func GetReviewWithUser(c *fiber.Ctx) error {
	reviewID := c.Params("id") // Review ID from URL params
	var review entity.Review

	// Preload the Account and Game relationships to get associated user and game data
	if err := database.DB.Preload("Account").First(&review, "id = ?", reviewID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Review not found"})
	}

	// Format the response with review, user, and game information
	response := fiber.Map{
		"id":         review.ID,
		"content":    review.Content,
		"rating":     review.Rating,
		"created_at": review.CreatedAt.Format("2006-01-02T15:04:05Z"),
		"user": fiber.Map{
			"id":         review.Account.ID,
			"username":   review.Account.Username,
			"profile_pic": review.Account.ProfilePic, // Assuming profile picture is part of the user model
		},
	}

	// Return the review with user and game data
	return c.JSON(response)
}

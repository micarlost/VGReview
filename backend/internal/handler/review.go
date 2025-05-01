package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/micarlost/VGReview/backend/configs/database"
	"github.com/micarlost/VGReview/backend/internal/entity"
)

// CreateReview handles the creation of a new review
func CreateReview(c *fiber.Ctx) error {
	var review entity.Review

	if err := c.BodyParser(&review); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	if review.Content == "" || review.Rating < 1 || review.Rating > 10 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing or invalid content/rating"})
	}

	if err := database.DB.Create(&review).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create review"})
	}

	return c.Status(fiber.StatusCreated).JSON(review)
}

// UpdateReview handles updating an existing review
func UpdateReview(c *fiber.Ctx) error {
	reviewID := c.Params("id")
	var review entity.Review

	if err := database.DB.First(&review, "id = ?", reviewID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Review not found"})
	}

	var updateData struct {
		Content string `json:"content"`
		Rating  int    `json:"rating"`
	}

	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	if updateData.Content != "" {
		review.Content = updateData.Content
	}
	if updateData.Rating >= 1 && updateData.Rating <= 10 {
		review.Rating = updateData.Rating
	}

	if err := database.DB.Save(&review).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update review"})
	}

	return c.JSON(review)
}

// DeleteReview deletes a review by ID
func DeleteReview(c *fiber.Ctx) error {
	reviewID := c.Params("id")
	var review entity.Review

	if err := database.DB.First(&review, "id = ?", reviewID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Review not found"})
	}

	if err := database.DB.Delete(&review).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete review"})
	}

	return c.JSON(fiber.Map{"message": "Review deleted successfully"})
}

// GetReviewWithUser returns a review and the associated user data
func GetReviewWithUser(c *fiber.Ctx) error {
	reviewID := c.Params("id")
	var review entity.Review

	// Preload the Account relationship
	if err := database.DB.Preload("Account").First(&review, "id = ?", reviewID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Review not found"})
	}

	response := fiber.Map{
		"id":         review.ID,
		"content":    review.Content,
		"rating":     review.Rating,
		"created_at": review.CreatedAt.Format("2006-01-02T15:04:05Z"),
		"game_id":    review.GameID,
		"account_id": review.AccountID,
	}

	return c.JSON(response)
}

// GetReviewsByGameID returns all reviews for a specific game
func GetReviewsByGameID(c *fiber.Ctx) error {
	gameID := c.Query("game_id")
	if gameID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Game ID is required"})
	}

	var reviews []entity.Review
	if err := database.DB.Where("game_id = ?", gameID).Find(&reviews).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch reviews"})
	}

	response := make([]fiber.Map, 0)
	for _, review := range reviews {
		response = append(response, fiber.Map{
			"id":         review.ID,
			"content":    review.Content,
			"rating":     review.Rating,
			"created_at": review.CreatedAt.Format("2006-01-02T15:04:05Z"),
			"account_id": review.AccountID,
		})
	}

	return c.JSON(response)
}

// GetReviewsByAccountID returns all reviews written by a specific user
func GetReviewsByAccountID(c *fiber.Ctx) error {
	accountID := c.Query("account_id")
	if accountID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Account ID is required"})
	}

	var reviews []entity.Review
	if err := database.DB.Where("account_id = ?", accountID).Find(&reviews).Error; err != nil {
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
		})
	}

	return c.JSON(response)
}

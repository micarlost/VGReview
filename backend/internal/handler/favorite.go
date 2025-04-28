package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/micarlost/VGReview/backend/configs/database"
	"github.com/micarlost/VGReview/backend/internal/entity"
	"gorm.io/gorm" 
	"strconv"
	"fmt"
)
// Add a favorite game for a user
func AddFavoriteGame(c *fiber.Ctx) error {
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

    var existing entity.FavoriteGame
    if err := database.DB.Where("account_id = ? AND game_id = ?", userID, gameID).First(&existing).Error; err != nil {
        if err != gorm.ErrRecordNotFound {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
        }
    } else {
        return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Game already favorited"})
    }

    favorite := entity.FavoriteGame{
        AccountID: uint(userID),
        GameID:    uint(gameID),
    }
    if err := database.DB.Create(&favorite).Error; err != nil {
        fmt.Println("Database error:", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to add favorite game"})
    }

    return c.JSON(fiber.Map{"message": "Game added to favorites"})
}


// Delete a favorite game for a user
func DeleteFavoriteGame(c *fiber.Ctx) error {
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

    fmt.Println("Trying to delete favorite for account:", userID, "game:", gameID)

    result := database.DB.
        Unscoped(). // <-- 🔥 this is the important fix
        Where("account_id = ? AND game_id = ?", uint(userID), uint(gameID)).
        Delete(&entity.FavoriteGame{})

    if result.Error != nil {
        fmt.Println("Database error during delete:", result.Error)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to remove favorite game"})
    }

    if result.RowsAffected == 0 {
        fmt.Println("No favorite found to delete for user", userID, "and game", gameID)
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Favorite game not found"})
    }

    fmt.Println("Favorite successfully deleted!")
    return c.JSON(fiber.Map{"message": "Game removed from favorites"})
}


func GetFavoriteGameIDs(userID uint) ([]uint, error) {
    var gameIDs []uint
    err := database.DB.
        Table("favorite_games").
        Where("account_id = ?", userID).
        Pluck("game_id", &gameIDs).Error
    return gameIDs, err
}
func ListFavoriteGames(c *fiber.Ctx) error {
    userIDStr := c.Params("user_id")
    userID, err := strconv.ParseUint(userIDStr, 10, 64)
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
    }

    gameIDs, err := GetFavoriteGameIDs(uint(userID))
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch favorite games"})
    }

    return c.JSON(fiber.Map{
        "favorite_game_ids": gameIDs,
    })
}

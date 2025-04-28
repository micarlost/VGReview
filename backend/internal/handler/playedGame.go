package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/micarlost/VGReview/backend/configs/database"
	"github.com/micarlost/VGReview/backend/internal/entity"
	"gorm.io/gorm" 
	"strconv"
	"fmt"
)
// Add a Played game for a user
func AddPlayedGame(c *fiber.Ctx) error {
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

    var existing entity.PlayedGame
    if err := database.DB.Where("account_id = ? AND game_id = ?", userID, gameID).First(&existing).Error; err != nil {
        if err != gorm.ErrRecordNotFound {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Database error"})
        }
    } else {
        return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Game already Played"})
    }

    Played := entity.PlayedGame{
        AccountID: uint(userID),
        GameID:    uint(gameID),
    }
    if err := database.DB.Create(&Played).Error; err != nil {
        fmt.Println("Database error:", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to add Played game"})
    }

    return c.JSON(fiber.Map{"message": "Game added to Playeds"})
}


// Delete a Played game for a user
func DeletePlayedGame(c *fiber.Ctx) error {
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

    fmt.Println("Trying to delete Played for account:", userID, "game:", gameID)

    result := database.DB.
        Unscoped(). // <-- 🔥 this is the important fix
        Where("account_id = ? AND game_id = ?", uint(userID), uint(gameID)).
        Delete(&entity.PlayedGame{})

    if result.Error != nil {
        fmt.Println("Database error during delete:", result.Error)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to remove Played game"})
    }

    if result.RowsAffected == 0 {
        fmt.Println("No Played found to delete for user", userID, "and game", gameID)
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Played game not found"})
    }

    fmt.Println("Played successfully deleted!")
    return c.JSON(fiber.Map{"message": "Game removed from Playeds"})
}


func GetPlayedGameIDs(userID uint) ([]uint, error) {
    var gameIDs []uint
    err := database.DB.
        Table("played_games").
        Where("account_id = ?", userID).
        Pluck("game_id", &gameIDs).Error
    return gameIDs, err
}
func ListPlayedGames(c *fiber.Ctx) error {
    userIDStr := c.Params("user_id")
    userID, err := strconv.ParseUint(userIDStr, 10, 64)
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
    }

    gameIDs, err := GetPlayedGameIDs(uint(userID))
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch Played games"})
    }

    return c.JSON(fiber.Map{
        "played_game_ids": gameIDs,
    })
}

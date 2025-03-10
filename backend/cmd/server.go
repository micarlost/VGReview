package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	configs "github.com/micarlost/VGReview/backend/configs/database"
	"github.com/micarlost/VGReview/backend/internal/entity"
	"github.com/micarlost/VGReview/backend/internal/igdb"
	"github.com/micarlost/VGReview/backend/internal/router"
	"gorm.io/gorm"
)

func initServer() (*fiber.App, *gorm.DB, error) {
	app := fiber.New(fiber.Config{BodyLimit: 500 * 1024 * 1024})

	// Initialize the database configuration
	conf := entity.Config{
		Host:     os.Getenv("DB_HOST"),
		Port:     os.Getenv("DB_PORT"),
		User:     os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASSWORD"),
		DBName:   os.Getenv("DB_NAME"),
		SSLMode:  os.Getenv("DB_SSLMODE"),
	}

	// Initialize the database
	db, err := configs.InitDB(conf)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to initialize database: %v", err)
	}

	fmt.Printf("Database initialized!\n")

	// Setup routes
	router.SetupRoutes(app)

	return app, db, nil
}

func getGamesHandler(c *fiber.Ctx) error {
	// Fetch IGDB data
	games, err := igdb.GetIGDBData()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Return the games as JSON
	return c.JSON(games)
}

func main() {
	// Load the environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Initialize the server
	app, _, err := initServer()
	if err != nil {
		log.Fatal(err)
	}

	listenAddr := os.Getenv("HOST_ADDR")
	if len(listenAddr) == 0 {
		listenAddr = ":8080"
	}

	app.Get("/games", getGamesHandler) // This registers the handler

	// Start the server
	if err := app.Listen(listenAddr); err != nil {
		log.Fatal(err)
	}
}

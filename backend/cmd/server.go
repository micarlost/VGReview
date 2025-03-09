package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	configs "github.com/micarlost/VGReview/backend/configs/database"
	"github.com/micarlost/VGReview/backend/internal/entity"
	"github.com/micarlost/VGReview/backend/internal/router"
)

func main() {
	app := fiber.New(fiber.Config{})

	// Load the environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Set the listen address
	listenAddr := os.Getenv("HOST_ADDR")
	if len(listenAddr) == 0 {
		listenAddr = ":8080"
	}

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
		log.Fatalf("Failed to initialize database: %v", err)
	}
	// Use the db variable to avoid the "declared and not used" error
	fmt.Printf("Database initialized: %v\n", db)

	// Start the server
	router.SetupRoutes(app)

	if err := app.Listen(listenAddr); err != nil {
		log.Fatal(err)
	}
}

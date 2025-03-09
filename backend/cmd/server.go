package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/healthcheck"
	"github.com/joho/godotenv"
	"github.com/micarlost/VGReview/backend/configs"
	"github.com/micarlost/VGReview/backend/internal/entity"
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

	// Enable CORS for all routes
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// Simple hello world test
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World!")
	})

	// Add healthcheck middleware for /livez and /readyz
	app.Use(healthcheck.New(healthcheck.Config{}))

	// Custom health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "OK"})
	})

	// Initialize the database
	db, err := configs.InitDB(conf)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	fmt.Printf("%v", db) // remove this when db is used in the core service

	if err := app.Listen(listenAddr); err != nil {
		log.Fatal(err)
	}
}

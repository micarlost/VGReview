package main

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	configs "github.com/micarlost/VGReview/backend/configs/database"
	"github.com/micarlost/VGReview/backend/internal/entity"
	"github.com/micarlost/VGReview/backend/internal/router"
	"gorm.io/gorm"
)

func initServer() (*fiber.App, *gorm.DB, error) {
	app := fiber.New(fiber.Config{})

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

func getIGDBData() error {
    url := "https://api.igdb.com/v4/games"
    clientID := os.Getenv("IGDB_CLIENT_ID")
    accessToken := os.Getenv("IGDB_ACCESS_TOKEN")

    body := []byte(`fields name, genre, summary, cover; limit 10;`)

    req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
    if err != nil {
        return fmt.Errorf("failed to create request: %v", err)
    }

    req.Header.Set("Client-ID", clientID)
    req.Header.Set("Authorization", "Bearer "+accessToken)
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return fmt.Errorf("failed to send request: %v", err)
    }
    defer resp.Body.Close()

    bodyResp, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return fmt.Errorf("failed to read response: %v", err)
    }

    fmt.Println("Response Status:", resp.Status)
    fmt.Println("Response Body:", string(bodyResp))

    return nil
}

func getGamesHandler(w http.ResponseWriter, r *http.Request) {
    games, err := igdb.GetIGDBData()
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(games)
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

	// Start the server
	if err := app.Listen(listenAddr); err != nil {
		log.Fatal(err)
	}

	if err := getIGDBData(); err != nil {
		log.Fatalf("Error fetching IGDB data: %v", err)
}

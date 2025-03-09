package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/micarlost/VGReview/backend/configs/database"
	"github.com/micarlost/VGReview/backend/internal/entity"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// setupApp sets up a Fiber app for the registration handler tests.
func setupApp() *fiber.App {
	app := fiber.New(fiber.Config{})
	app.Post("/register", Register)
	return app
}

// setupTestDB sets up a test database for the registration handler tests.
func setupTestDB(t *testing.T) {
	var err error

	dsn := "host=postgres user=postgres password=1234 dbname=csudh_test port=5432 sslmode=disable"
	database.DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	err = database.DB.AutoMigrate(&entity.Account{})
	if err != nil {
		t.Fatalf("Failed to migrate test database: %v", err)
	}

	defer clearAccountsTable(t)
}

func clearAccountsTable(t *testing.T) {
	err := database.DB.Exec("DELETE FROM accounts").Error
	if err != nil {
		t.Fatalf("Failed to clear accounts table: " + err.Error())
	}
}

// TestRegister tests the registration handler.
func TestRegister(t *testing.T) {
	app := setupApp()
	setupTestDB(t)

	// Test cases for registration
	tests := []struct {
		name           string
		payload        map[string]string
		expectedStatus int
		expectedBody   map[string]string
	}{
		{
			name: "Successful registration",
			payload: map[string]string{
				"username":         "testuser",
				"email":            "test@example.com",
				"password":         "password123",
				"confirm_password": "password123",
			},
			expectedStatus: fiber.StatusOK,
			expectedBody:   map[string]string{"message": "User registered successfully"},
		},
		{
			name: "Passwords do not match",
			payload: map[string]string{
				"username":         "testuser",
				"email":            "test@example.com",
				"password":         "password123",
				"confirm_password": "password321",
			},
			expectedStatus: fiber.StatusBadRequest,
			expectedBody:   map[string]string{"message": "Passwords do not match"},
		},
		{
			name: "Account already exists",
			payload: map[string]string{
				"username":         "testuser",
				"email":            "test@example.com",
				"password":         "password123",
				"confirm_password": "password123",
			},
			expectedStatus: fiber.StatusInternalServerError,
			expectedBody:   map[string]string{"message": "ERROR: duplicate key value violates unique constraint \"uni_accounts_email\" (SQLSTATE 23505)"},
		},
	}

	// Run tests
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.payload)
			req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")

			resp, _ := app.Test(req)

			assert.Equal(t, tt.expectedStatus, resp.StatusCode)

			var responseBody map[string]string
			json.NewDecoder(resp.Body).Decode(&responseBody)
			assert.Equal(t, tt.expectedBody, responseBody)
		})
	}
}

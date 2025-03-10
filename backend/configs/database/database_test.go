package database

import (
	"testing"

	"github.com/micarlost/VGReview/backend/internal/entity"
	"github.com/stretchr/testify/assert"
)

func TestInitDB(t *testing.T) {
	// Mock database configuration
	cfg := entity.Config{
		Host:     "postgres",
		User:     "postgres",
		Password: "soundwave",
		Port:     "5432",
		DBName:   "megatron",
		SSLMode:  "disable",
	}

	// Call InitDB function
	db, err := InitDB(cfg)

	tx := db.Begin()
 
	// Rollback the transaction
	defer tx.Rollback()

	// Test for error
	assert.NoError(t, err, "Expected no error when initializing the database")

	// Test for DB connection
	assert.NotNil(t, db, "Expected a valid database connection")

	// Check if the DB variable is set
	assert.NotNil(t, DB, "Expected the global DB variable to be set")

	// Test for migrations (checking the Account table)
	var count int64
	err = db.Model(&entity.Account{}).Count(&count).Error
	assert.NoError(t, err, "Expected no error when counting accounts")
	assert.GreaterOrEqual(t, count, int64(0), "Expected at least 0 accounts")
}

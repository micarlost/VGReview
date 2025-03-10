package main

import (
	"os"
	"testing"

	"github.com/micarlost/VGReview/backend/internal/entity"
	"github.com/stretchr/testify/assert"
)

func TestInitApp(t *testing.T) {
	// Set environment variables for testing
	os.Setenv("DB_HOST", "postgres")
	os.Setenv("DB_PORT", "5432")
	os.Setenv("DB_USER", "postgres")
	os.Setenv("DB_PASSWORD", "soundwave")
	os.Setenv("DB_NAME", "megatron")
	os.Setenv("DB_SSLMODE", "disable")

	server, db, err := initServer()

	// Test for errors
	assert.NoError(t, err, "Expected no error when initializing the app")

	// Test for valid server and database
	assert.NotNil(t, server, "Expected a valid Fiber server")
	assert.NotNil(t, db, "Expected a valid database connection")

	// Check that the DB is connected
	var count int64
	err = db.Model(&entity.Account{}).Count(&count).Error
	assert.NoError(t, err, "Expected no error when counting accounts")
	assert.GreaterOrEqual(t, count, int64(0), "Expected at least 0 accounts")
}
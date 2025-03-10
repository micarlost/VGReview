package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

// JWT claims structure
func GenerateJWT(email string) (string, error) {

	// Get the secret key from an environment variable for security
	secretKey := []byte(os.Getenv("JWT_SECRET"))

	// Set token expiration time
	expirationTime := time.Now().Add(24 * time.Hour)

	// Create claims using jwt.MapClaims
	claims := jwt.MapClaims{

		"email": email,
		"exp":   expirationTime.Unix(),
	}

	// Create a new JWT token with MapClaims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with the secret key
	tokenString, err := token.SignedString(secretKey)

	if err != nil {

		return "", err
	}

	return tokenString, nil
}

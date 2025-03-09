package utils

import (
	"github.com/sandbox-science/online-learning-platform/internal/entity"
	"golang.org/x/crypto/bcrypt"
)

// HashPassword hashes the user's password using bcrypt.
func HashPassword(user *entity.Account) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), 12)
	if err != nil {
		return err
	}

	user.Password = string(hashedPassword)
	return nil
}

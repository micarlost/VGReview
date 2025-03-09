package entity

import "gorm.io/gorm"

type Account struct {
	gorm.Model
	ID       uint   `json:"id" gorm:"primaryKey;autoIncrement"`
	Username string `gorm:"size:255;not null;" json:"username"`
	Password string `gorm:"size:255;not null;" json:"-"`
	Email    string `gorm:"size:100;not null;unique" json:"email"`
}

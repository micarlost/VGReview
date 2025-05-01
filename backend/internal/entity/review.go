package entity

import (
	"gorm.io/gorm"
)

type Review struct {
	gorm.Model
	Content   string `gorm:"type:text;not null" json:"content"`
	Rating    int    `gorm:"not null" json:"rating"`
	GameID    uint   `gorm:"not null" json:"game_id"`
	AccountID uint   `gorm:"not null" json:"account_id"`
}

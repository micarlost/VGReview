package entity

import "gorm.io/gorm"

type Review struct {
	gorm.Model
	Content   string   `json:"content"`
	Rating    int      `json:"rating"`
	GameID    uint     `json:"game_id"`
	AccountID uint     `json:"account_id"`
}

package entity

import "gorm.io/gorm"

type FavoriteGame struct {
    gorm.Model
    AccountID uint `gorm:"not null"`
    GameID    uint `gorm:"not null"` // This is the IGDB Game ID
}

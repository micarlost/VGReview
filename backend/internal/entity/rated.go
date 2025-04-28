package entity

import "gorm.io/gorm"

type Rated struct {
    gorm.Model
    AccountID uint `gorm:"not null"`
    GameID    uint `gorm:"not null"` // This is the IGDB Game ID
    Rating    uint `gorm:"not null"` // Rating out of 5
}

package entity

import "gorm.io/gorm"

// Game represents a video game in the database
type Game struct {
	gorm.Model
	Title         string
	ImageLocation string
	Description   string
	Reviews       []Review   `gorm:"foreignKey:GameID" json:"reviews"`
	FavoritedBy   []Account  `gorm:"many2many:account_favorite_games;" json:"-"`
}

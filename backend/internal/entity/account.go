package entity

import "gorm.io/gorm"

type Account struct {
	gorm.Model
	Username string `gorm:"size:255;not null;" json:"username"`
	Password string `gorm:"size:255;not null;" json:"-"`
	Email    string `gorm:"size:100;not null;unique" json:"email"`
	Bio             string `gorm:"type:text" json:"bio"`            // Description or about me
	ProfilePic  string `json:"profile_pic"`
	FavoriteGames   []Game `gorm:"many2many:account_favorite_games;" json:"favorite_games"`
	Reviews         []Review `gorm:"foreignKey:AccountID" json:"reviews"`
}

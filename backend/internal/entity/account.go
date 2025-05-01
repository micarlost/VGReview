package entity

import "gorm.io/gorm"

type Account struct {
	gorm.Model
	Username string `gorm:"size:255;not null;" json:"username"`
	Password string `gorm:"size:255;not null;" json:"-"`
	Email    string `gorm:"size:100;not null;unique" json:"email"`
	Bio             string `gorm:"type:text" json:"bio"`            
	ProfilePic  string `json:"profile_pic"`
	FavoriteGames []FavoriteGame `gorm:"foreignKey:AccountID" json:"favorite_games"`
	PlayedGames []PlayedGame `gorm:"foreignKey:AccountID" json:"played_games"`
	RatedGames []Rated `gorm:"foreignKey:AccountID" json:"rated_games"`
	Reviews         []Review `gorm:"foreignKey:AccountID" json:"reviews"`
	Following []Account `gorm:"many2many:account_followings;joinForeignKey:FollowerID;joinReferences:FollowedID" json:"following"`
}

package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/micarlost/VGReview/backend/configs/database"
	"github.com/micarlost/VGReview/backend/internal/entity"
	"fmt"
    "os"
)

// Delete function fully delete a user account from the database
func AllAccounts(c *fiber.Ctx) error {
	var users []entity.Account

	// Query the database to get all users
	if err := database.DB.Find(&users).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Error fetching users"})
	}

	// Return the users as JSON
	return c.JSON(fiber.Map{
		"users": users,
	})
}
func UpdateProfilePic(c *fiber.Ctx) error {
    userID := c.Params("user_id")
    var user entity.Account

    // Check if the user exists
    if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
    }

    // Get the uploaded file
    file, err := c.FormFile("profile_pic")
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No file uploaded"})
    }

    // Create a directory to store profile pictures if it doesn't exist
    if err := os.MkdirAll("./uploads/profile_pics/", 0755); err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create directory"})
    }

    // Save the file
    filePath := fmt.Sprintf("./uploads/profile_pics/%d_%s", user.ID, file.Filename)
    if err := c.SaveFile(file, filePath); err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save file"})
    }

    // Update the user profile with the file path
    user.ProfilePic = filePath
    if err := database.DB.Save(&user).Error; err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update user profile"})
    }

    return c.JSON(fiber.Map{
        "message": "Profile picture updated successfully",
        "profile_pic": filePath,
    })
	
}

func UpdateProfileDescription(c *fiber.Ctx) error {
	userID := c.Params("user_id")
	var user entity.Account

	// Check if the user exists
	if err := database.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	// Parse request body
	var body struct {
		Bio string `json:"bio"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Update and save
	user.Bio = body.Bio
	if err := database.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update profile bio"})
	}

	return c.JSON(fiber.Map{
		"message": "Profile description updated successfully",
		"bio":     user.Bio,
	})
}

func FollowUser(c *fiber.Ctx) error {
	followerID := c.Params("follower_id")
	followedID := c.Params("followed_id")

	var follower entity.Account
	var followed entity.Account

	// Find both accounts
	if err := database.DB.First(&follower, followerID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Follower not found"})
	}
	if err := database.DB.First(&followed, followedID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User to follow not found"})
	}

	// Append the followed user to follower's following list
	if err := database.DB.Model(&follower).Association("Following").Append(&followed); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to follow user"})
	}

	return c.JSON(fiber.Map{"message": "User followed successfully"})
}


func UnfollowUser(c *fiber.Ctx) error {
	followerID := c.Params("follower_id")
	followedID := c.Params("followed_id")

	var follower entity.Account
	var followed entity.Account

	// Find both accounts
	if err := database.DB.First(&follower, followerID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Follower not found"})
	}
	if err := database.DB.First(&followed, followedID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User to unfollow not found"})
	}

	// Remove the followed user from follower's following list
	if err := database.DB.Model(&follower).Association("Following").Delete(&followed); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to unfollow user"})
	}

	return c.JSON(fiber.Map{"message": "User unfollowed successfully"})
}

func IsFollowing(c *fiber.Ctx) error {
    followerID := c.Params("follower_id")
    followedID := c.Params("followed_id")

    var follower entity.Account
    var followed entity.Account

    // Find both accounts
    if err := database.DB.First(&follower, followerID).Error; err != nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Follower not found"})
    }
    if err := database.DB.First(&followed, followedID).Error; err != nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User to check not found"})
    }

    // Check if the followed user is in the follower's Following array
    isFollowing := false
    for _, followedUser := range follower.Following {
        if followedUser.ID == followed.ID {
            isFollowing = true
            break
        }
    }

    return c.JSON(fiber.Map{
        "is_following": isFollowing,
    })
}

func GetFollowingList(c *fiber.Ctx) error {
    userID := c.Params("user_id")
    var user entity.Account

    // Check if the user exists
    if err := database.DB.First(&user, userID).Error; err != nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
    }

    // Get the list of users the current user is following
    var following []entity.Account
    if err := database.DB.Model(&user).Association("Following").Find(&following); err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error fetching following list"})
    }

    return c.JSON(fiber.Map{
        "following": following,
    })
}

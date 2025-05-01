package router

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/healthcheck"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/micarlost/VGReview/backend/internal/handler"
)

var (
	limitedCtx    = map[string]context.Context{}
	limitedCancel = map[string]context.CancelFunc{}
)

func limiterNext(c *fiber.Ctx) bool {
	if ctx, ok := limitedCtx[c.IP()]; ok {
		select {
		case <-ctx.Done():
			limitedCancel[c.IP()]()
			delete(limitedCancel, c.IP())
			delete(limitedCtx, c.IP())
			return true
		default:
			return false
		}
	}
	return false
}

func limiterReached(c *fiber.Ctx) error {
	if _, ok := limitedCtx[c.IP()]; ok {
		return c.SendStatus(fiber.StatusTooManyRequests)
	}
	limitedCtx[c.IP()], limitedCancel[c.IP()] = context.WithTimeout(context.Background(), 1*time.Hour)
	return c.SendStatus(fiber.StatusTooManyRequests)
}

func SetupRoutes(app *fiber.App) {
	// Rate limiter middleware
	app.Use(limiter.New(limiter.Config{
		Max:          3000,
		Expiration:   1 * time.Hour,
		Next:         limiterNext,
		LimitReached: limiterReached,
	}))

	// Enable CORS for all routes
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000",
		AllowCredentials: true,
		AllowHeaders: "Origin, Content-Type, Accept",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
	}))

	// Simple hello world test
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World!")
	})

	// Add healthcheck middleware for /livez and /readyz
	app.Use(healthcheck.New(healthcheck.Config{}))

	// Custom health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "OK"})
	})

	// Define route for user registration
	app.Post("/register", handler.Register)
	app.Post("/login", handler.Login)
	app.Delete("/delete", handler.Delete)
	app.Get("/user/:user_id", handler.User)
	app.Put("/update-username", handler.UpdateUsername) // Update username
	app.Put("/update-email", handler.UpdateEmail)       // Update email with confirmation
	app.Put("/update-password", handler.UpdatePassword) // Update password and log user off after

	// Define route for fetching games
	app.Get("/games", handler.GetGamesHandler)
	app.Get("/account", handler.AllAccounts)

	//Profile edits
	app.Post("/user/:user_id/profile-pic", handler.UpdateProfilePic)
	app.Put("/user/:user_id/profile-description", handler.UpdateProfileDescription)
	app.Static("/uploads", "./uploads")


	//Routes for IGDB
	app.Get("/api/games/upcoming", handler.GetUpcomingGamesHandler)
	app.Get("/api/games/new", handler.GetNewReleasesHandler)
	app.Get("/api/games/search", handler.SearchGamesWithLimitOffset)
	app.Get("/api/games/:id", handler.GetGameData)

	//Routes for favorites
	app.Post("/user/:user_id/favorite/:game_id", handler.AddFavoriteGame)
	app.Delete("/user/:user_id/favorite/:game_id", handler.DeleteFavoriteGame)
	app.Get("/user/:user_id/favorite/", handler.ListFavoriteGames)

	//Routes for played
	app.Post("/user/:user_id/played/:game_id", handler.AddPlayedGame)
	app.Delete("/user/:user_id/played/:game_id", handler.DeletePlayedGame)
	app.Get("/user/:user_id/played/", handler.ListPlayedGames)

	//Routes for rated
	app.Post("/user/:user_id/rating/:game_id", handler.AddRating)
	app.Put("/user/:user_id/rating/:game_id", handler.UpdateRating) // Update rating
	app.Get("/user/:user_id/rating/:game_id", handler.GetRating) // Get rating
	app.Delete("/user/:user_id/game/:game_id/rating", handler.DeleteRating) // Delete rating
	app.Get("/user/:user_id/ratings", handler.ListRatedGames) //List Rated Games

	//Routes for reviews
	app.Post("/reviews", handler.CreateReview)
	app.Get("/reviews/:id", handler.GetReviewWithUser)
	app.Put("/reviews/:id", handler.UpdateReview)
	app.Delete("/reviews/:id", handler.DeleteReview)
	app.Get("/games/:game_id/reviews", handler.GetReviewsByGameID)
	app.Get("/accounts/:account_id/reviews", handler.GetReviewsByAccountID)


	//Routes for following
	app.Get("/user/:follower_id/follows/:followed_id", handler.IsFollowing)
	app.Post("/users/:follower_id/follow/:followed_id", handler.FollowUser)
	app.Delete("/users/:follower_id/unfollow/:followed_id", handler.UnfollowUser)
	app.Get("/user/:user_id/following", handler.GetFollowingList)










}

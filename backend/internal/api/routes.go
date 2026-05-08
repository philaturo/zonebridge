package api

import (
	"zonebridge/internal/auth"
	"zonebridge/internal/config"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, handler *Handler, cfg *config.Config) {
	// CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.FrontendURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Public routes
	r.GET("/auth/gitea", handler.GetAuthURL)
	r.GET("/auth/callback", handler.AuthCallback)

	// WebSocket
	r.GET("/ws", handler.hub.HandleWebSocket)

	// Protected routes
	api := r.Group("/api")
	api.Use(auth.Middleware(cfg))
	{
		// User
		api.GET("/me", handler.GetMe)

		// Skills
		api.GET("/skills", handler.GetSkills)
		api.GET("/users", handler.GetUsersBySkill)
		api.PUT("/me/skills", handler.UpdateMySkills)

		// Availability
		api.PATCH("/me/availability", handler.UpdateAvailability)

		// Projects
		api.GET("/projects", handler.GetProjects)

		// PostMortems
		api.GET("/postmortems", handler.GetPostMortems)
		api.POST("/postmortems", handler.CreatePostMortem)
		api.POST("/postmortems/:id/upvote", handler.UpvotePostMortem)

		// Activities
		api.GET("/activities", handler.GetActivities)
	}
}
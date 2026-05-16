package api

import (
	"time"

	"zonebridge/internal/auth"
	"zonebridge/internal/config"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, handler *Handler, cfg *config.Config) {
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:8080", "https://learn.zone01kisumu.ke"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type", "Location"},
		AllowCredentials: true, // CRITICAL: allows cookies
		MaxAge:           12 * time.Hour,
	}))

	// Public routes
	r.GET("/auth/gitea", handler.GetAuthURL)
	r.GET("/auth/callback", handler.AuthCallback)
	r.POST("/auth/logout", handler.Logout) // NEW

	// WebSocket
	r.GET("/ws", handler.hub.HandleWebSocket)

	// Protected routes
	api := r.Group("/api")
	api.Use(auth.Middleware(cfg))
	{
		api.GET("/me", handler.GetMe)
		api.GET("/skills", handler.GetSkills)
		api.GET("/users", handler.GetUsersBySkill)
		api.PUT("/me/skills", handler.UpdateMySkills)
		api.POST("/skills", handler.CreateSkill) 
		api.PATCH("/me/availability", handler.UpdateAvailability)
		api.GET("/projects", handler.GetProjects)
		api.GET("/postmortems", handler.GetPostMortems)
		api.POST("/postmortems", handler.CreatePostMortem)
		api.GET("/me/postmortems", handler.GetMyPostMortems)
		api.POST("/postmortems/:id/upvote", handler.UpvotePostMortem)
		api.GET("/activities", handler.GetActivities)
		api.GET("/users/all", handler.GetAllUsers)
		api.GET("/users/online", handler.GetAvailableUsers)
		api.GET("/postmortems/:id/comments", handler.GetComments)
		api.POST("/postmortems/:id/comments", handler.CreateComment)

			// Help Requests
		api.GET("/help-requests", handler.GetHelpRequests)
		api.POST("/help-requests", handler.CreateHelpRequest)
		api.PATCH("/help-requests/:id/accept", handler.AcceptHelpRequest)
		api.PATCH("/help-requests/:id/resolve", handler.ResolveHelpRequest)

	}
}
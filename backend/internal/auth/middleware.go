package auth

import (
	"net/http"

	"zonebridge/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func Middleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := GetTokenFromCookie(c.Request)
		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing authentication"})
			return
		}

		claims, err := ValidateToken(tokenString, cfg)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Next()
	}
}

func GetUserID(c *gin.Context) uuid.UUID {
	id, _ := c.Get("user_id")
	return id.(uuid.UUID)
}
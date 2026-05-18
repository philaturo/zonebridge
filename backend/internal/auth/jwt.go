package auth

import (
	"fmt"
	"net/http"
	"time"

	"zonebridge/internal/config"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type Claims struct {
	UserID   uuid.UUID `json:"user_id"`
	Username string    `json:"username"`
	jwt.RegisteredClaims
}

func GenerateToken(userID uuid.UUID, username string, cfg *config.Config) (string, error) {
	claims := Claims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "zonebridge",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(cfg.JWTSecret))
}

func ValidateToken(tokenString string, cfg *config.Config) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(cfg.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token claims")
}

// SetAuthCookie sets the JWT as an HttpOnly cookie
func SetAuthCookie(w http.ResponseWriter, token string, cfg *config.Config) {
    sameSite := http.SameSiteLaxMode
    secure := false

    if cfg.Env == "production" {
        sameSite = http.SameSiteLaxMode  // Lax is fine for same-origin
        secure = true
    }

    cookie := &http.Cookie{
        Name:     "auth_token",
        Value:    token,
        Path:     "/",
        MaxAge:   86400,
        HttpOnly: true,
        SameSite: sameSite,
        Secure:   secure,
    }
    http.SetCookie(w, cookie)
}

// ClearAuthCookie clears the auth cookie
func ClearAuthCookie(w http.ResponseWriter) {
	cookie := &http.Cookie{
		Name:     "auth_token",
		Value:    "",
		Path:     "/",		
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode,
		Secure:   true,
	}
	http.SetCookie(w, cookie)
}

// GetTokenFromCookie extracts token from cookie (fallback to header)
func GetTokenFromCookie(r *http.Request) string {
	// 1. Check cookie first
	if cookie, err := r.Cookie("auth_token"); err == nil && cookie.Value != "" {
		return cookie.Value
	}
	// 2. Fallback to Authorization header (for WebSocket or API clients)
	authHeader := r.Header.Get("Authorization")
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		return authHeader[7:]
	}
	return ""
}
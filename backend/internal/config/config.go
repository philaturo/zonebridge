package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL      string
	GiteaURL         string
	GiteaClientID    string
	GiteaClientSecret string
	GiteaRedirectURI string
	JWTSecret        string
	JWTExpiry        string
	Port             string
	FrontendURL      string
	Env              string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	return &Config{
		DatabaseURL:       getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/zonebridge?sslmode=disable"),
		GiteaURL:          getEnv("GITEA_URL", "https://learn.zone01kisumu.ke/git"),
		GiteaClientID:     getEnv("GITEA_CLIENT_ID", ""),
		GiteaClientSecret: getEnv("GITEA_CLIENT_SECRET", ""),
		GiteaRedirectURI:  getEnv("GITEA_REDIRECT_URI", "http://localhost:8080/auth/callback"),
		JWTSecret:         getEnv("JWT_SECRET", "dev-secret"),
		JWTExpiry:         getEnv("JWT_EXPIRY", "24h"),
		Port:              getEnv("PORT", "8080"),
		FrontendURL:       getEnv("FRONTEND_URL", "http://localhost:5173"),
		Env:               getEnv("ENV", "development"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
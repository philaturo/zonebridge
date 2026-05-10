package main

import (
	"log"

	"zonebridge/internal/api"
	"zonebridge/internal/client"
	"zonebridge/internal/config"
	"zonebridge/internal/store"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load config
	cfg := config.Load()

	// Initialize database
	db, err := store.New(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize schema
	if err := db.InitSchema(); err != nil {
		log.Fatalf("Failed to initialize schema: %v", err)
	}

	// Seed data
	if err := db.SeedData(); err != nil {
		log.Fatalf("Failed to seed data: %v", err)
	}

	// Initialize Gitea client
	giteaClient := client.NewGiteaClient(cfg)

	// Initialize WebSocket hub
	hub := api.NewHub(cfg)
	go hub.Run()

	// Initialize handler
	handler := api.NewHandler(db, giteaClient, hub, cfg)

	// Setup routes
	r := gin.Default()
	api.SetupRoutes(r, handler, cfg)

	// Start server
	log.Printf("Server starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
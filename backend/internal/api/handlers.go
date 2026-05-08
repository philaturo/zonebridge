package api

import (
	"net/http"

	"zonebridge/internal/auth"
	"zonebridge/internal/client"
	"zonebridge/internal/config"
	"zonebridge/internal/models"
	"zonebridge/internal/store"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	store       *store.Store
	giteaClient *client.GiteaClient
	hub         *Hub
	cfg         *config.Config
}

func NewHandler(store *store.Store, giteaClient *client.GiteaClient, hub *Hub, cfg *config.Config) *Handler {
	return &Handler{
		store:       store,
		giteaClient: giteaClient,
		hub:         hub,
		cfg:         cfg,
	}
}

// Auth handlers
func (h *Handler) GetAuthURL(c *gin.Context) {
	url := h.giteaClient.GetOAuthURL(h.cfg.GiteaClientID, h.cfg.GiteaRedirectURI)
	c.JSON(http.StatusOK, gin.H{"auth_url": url})
}

func (h *Handler) AuthCallback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing code"})
		return
	}

	// Exchange code for token
	accessToken, err := h.giteaClient.ExchangeCodeForToken(code, h.cfg.GiteaClientID, h.cfg.GiteaClientSecret, h.cfg.GiteaRedirectURI)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "failed to exchange code", "details": err.Error()})
		return
	}

	// Get user from Gitea
	giteaUser, err := h.giteaClient.GetUser(accessToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "failed to get user", "details": err.Error()})
		return
	}

	// Create or update user in DB
	user, err := h.store.CreateOrUpdateUser(giteaUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save user", "details": err.Error()})
		return
	}

	// Generate JWT
	token, err := auth.GenerateToken(user.ID, user.Username, h.cfg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	// Redirect to frontend with token
	c.Redirect(http.StatusTemporaryRedirect, h.cfg.FrontendURL+"/auth/callback?token="+token)
}

func (h *Handler) GetMe(c *gin.Context) {
	userID := auth.GetUserID(c)
	user, err := h.store.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	// Get user skills
	skills, _ := h.store.GetUserSkills(userID)
	userWithSkills := struct {
		*models.User
		Skills []models.Skill `json:"skills"`
	}{
		User:   user,
		Skills: skills,
	}

	c.JSON(http.StatusOK, userWithSkills)
}

// Skill handlers
func (h *Handler) GetSkills(c *gin.Context) {
	skills, err := h.store.GetAllSkills()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get skills"})
		return
	}
	c.JSON(http.StatusOK, skills)
}

func (h *Handler) GetUsersBySkill(c *gin.Context) {
	slug := c.Query("slug")
	if slug == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing skill slug"})
		return
	}

	users, err := h.store.GetUsersBySkill(slug)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get users"})
		return
	}
	c.JSON(http.StatusOK, users)
}

func (h *Handler) UpdateMySkills(c *gin.Context) {
	userID := auth.GetUserID(c)
	var req models.UpdateSkillsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if err := h.store.UpdateUserSkills(userID, req.Skills); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update skills"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "skills updated"})
}

// Availability handlers
func (h *Handler) UpdateAvailability(c *gin.Context) {
	userID := auth.GetUserID(c)
	var req models.UpdateAvailabilityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if err := h.store.UpdateAvailability(userID, req.Available); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update availability"})
		return
	}

	// Create activity and broadcast
	user, _ := h.store.GetUserByID(userID)
	activity, _ := h.store.CreateActivity("USER_AVAILABLE", userID, map[string]interface{}{
		"username":    user.Username,
		"display_name": user.DisplayName,
		"avatar_url":   user.AvatarURL,
		"available":    req.Available,
	})
	if activity != nil {
		h.hub.BroadcastActivity(activity)
	}

	c.JSON(http.StatusOK, gin.H{"available": req.Available})
}

// Project handlers
func (h *Handler) GetProjects(c *gin.Context) {
	projects, err := h.store.GetAllProjects()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get projects"})
		return
	}
	c.JSON(http.StatusOK, projects)
}

// PostMortem handlers
func (h *Handler) CreatePostMortem(c *gin.Context) {
	userID := auth.GetUserID(c)
	var req models.CreatePostMortemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	var projectID *uuid.UUID
	if req.ProjectID != nil && *req.ProjectID != "" {
		pid, err := uuid.Parse(*req.ProjectID)
		if err == nil {
			projectID = &pid
		}
	}

	pm := &models.PostMortem{
		UserID:      userID,
		ProjectID:   projectID,
		ProjectName: req.ProjectName,
		GiteaRepo:   req.GiteaRepo,
		Challenge:   req.Challenge,
		Solution:    req.Solution,
		Regret:      req.Regret,
		Tags:        req.Tags,
	}

	if err := h.store.CreatePostMortem(pm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create post-mortem"})
		return
	}

	// Broadcast activity
	user, _ := h.store.GetUserByID(userID)
	activity, _ := h.store.CreateActivity("NEW_POSTMORTEM", userID, map[string]interface{}{
		"username":     user.Username,
		"display_name":  user.DisplayName,
		"project_name":  req.ProjectName,
		"post_mortem_id": pm.ID,
	})
	if activity != nil {
		h.hub.BroadcastActivity(activity)
	}

	c.JSON(http.StatusCreated, pm)
}

func (h *Handler) GetPostMortems(c *gin.Context) {
	skillSlug := c.Query("skill")
	postMortems, err := h.store.GetPostMortems(skillSlug)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get post-mortems"})
		return
	}
	c.JSON(http.StatusOK, postMortems)
}

func (h *Handler) UpvotePostMortem(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.store.UpvotePostMortem(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to upvote"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "upvoted"})
}

// Activity handlers
func (h *Handler) GetActivities(c *gin.Context) {
	activities, err := h.store.GetRecentActivities(50)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get activities"})
		return
	}
	c.JSON(http.StatusOK, activities)
}
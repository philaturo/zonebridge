package api

import (
	"log"
	"net/http"
	"strings"

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

// GetAuthURL redirects to Gitea OAuth
func (h *Handler) GetAuthURL(c *gin.Context) {
	url := h.giteaClient.GetOAuthURL(h.cfg.GiteaClientID, h.cfg.GiteaRedirectURI)
	log.Printf("[OAuth] Redirecting to Gitea: %s", url)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

// AuthCallback handles Gitea OAuth callback
func (h *Handler) AuthCallback(c *gin.Context) {
	log.Printf("[OAuth] Callback received: %s", c.Request.URL.String())

	// CASE 1: Gitea sent us a JWT token directly (SSO auto-login)
	token := c.Query("token")
	if token != "" {
		log.Printf("[OAuth] Received direct token from Gitea")

		// Validate it's our JWT
		claims, err := auth.ValidateToken(token, h.cfg)
		if err == nil {
			log.Printf("[OAuth] Token valid for user: %s", claims.Username)

			// === FIX: Set HTTP-only cookie and redirect to frontend ===
			auth.SetAuthCookie(c.Writer, token, h.cfg)

			// Redirect to frontend dashboard (NO token in URL)
			redirectURL := h.cfg.FrontendURL + "/"
			log.Printf("[OAuth] Cookie set. Redirecting to: %s", redirectURL)
			c.Redirect(http.StatusTemporaryRedirect, redirectURL)
			return
		}

		log.Printf("[OAuth] Token invalid: %v", err)
		// Token was invalid, fall through to try standard OAuth flow
	}

	// CASE 2: Standard OAuth flow with authorization code
	code := c.Query("code")
	if code == "" {
		log.Printf("[OAuth] Error: no code or valid token in callback")
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "missing authorization code",
			"url":   c.Request.URL.String(),
		})
		return
	}

	log.Printf("[OAuth] Exchanging code for token...")

	// Exchange code for access token
	accessToken, err := h.giteaClient.ExchangeCodeForToken(
		code,
		h.cfg.GiteaClientID,
		h.cfg.GiteaClientSecret,
		h.cfg.GiteaRedirectURI,
	)
	if err != nil {
		log.Printf("[OAuth] Token exchange failed: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "failed to exchange code",
			"details": err.Error(),
		})
		return
	}

	log.Printf("[OAuth] Fetching user from Gitea...")

	// Get user from Gitea
	giteaUser, err := h.giteaClient.GetUser(accessToken)
	if err != nil {
		log.Printf("[OAuth] GetUser failed: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "failed to get user",
			"details": err.Error(),
		})
		return
	}

	log.Printf("[OAuth] User: %s (ID: %d)", giteaUser.Login, giteaUser.ID)

	// Create or update user in DB
	user, err := h.store.CreateOrUpdateUser(giteaUser)
	if err != nil {
		log.Printf("[OAuth] DB error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "failed to save user",
			"details": err.Error(),
		})
		return
	}

	log.Printf("[OAuth] Storing token for user: %s", user.Username)

if err := h.store.UpdateUserToken(user.ID, accessToken); err != nil {
    log.Printf("[OAuth] Failed to store token: %v", err)
} else {
    log.Printf("[OAuth] Token stored successfully")
}

	log.Printf("[OAuth] Generating JWT...")

	// Generate JWT
	jwtToken, err := auth.GenerateToken(user.ID, user.Username, h.cfg)
	if err != nil {
		log.Printf("[OAuth] JWT generation failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	// === FIX: Set HTTP-only cookie and redirect to frontend ===
	auth.SetAuthCookie(c.Writer, jwtToken, h.cfg)

	// Redirect to frontend dashboard (NO token in URL)
	redirectURL := h.cfg.FrontendURL + "/"
	log.Printf("[OAuth] Cookie set. Redirecting to: %s", redirectURL)
	c.Redirect(http.StatusTemporaryRedirect, redirectURL)
}

// GetMe returns current authenticated user
func (h *Handler) GetMe(c *gin.Context) {
	userID := auth.GetUserID(c)
	user, err := h.store.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	skills, _ := h.store.GetUserSkills(userID)
	c.JSON(http.StatusOK, gin.H{
		"user":   user,
		"skills": skills,
	})
}

// GetSkills returns all skills
func (h *Handler) GetSkills(c *gin.Context) {
	skills, err := h.store.GetAllSkills()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get skills"})
		return
	}
	c.JSON(http.StatusOK, skills)
}

// CreateSkill creates a new skill (organic growth)
func (h *Handler) CreateSkill(c *gin.Context) {
	var req struct {
		Name     string `json:"name" binding:"required"`
		Category string `json:"category"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
		return
	}

	// Auto-generate slug from name
	slug := slugify(req.Name)
	if slug == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid skill name"})
		return
	}

	skill, err := h.store.CreateSkillIfNotExists(req.Name, slug, req.Category)
	if err != nil {
		log.Printf("[Skills] Create error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create skill"})
		return
	}

	c.JSON(http.StatusCreated, skill)
}

// slugify converts a string to URL-friendly slug
func slugify(s string) string {
	// Simple slugify: lowercase, replace spaces with hyphens, remove special chars
	result := ""
	for _, r := range strings.ToLower(s) {
		switch {
		case r >= 'a' && r <= 'z':
			result += string(r)
		case r >= '0' && r <= '9':
			result += string(r)
		case r == ' ' || r == '-':
			if len(result) > 0 && result[len(result)-1] != '-' {
				result += "-"
			}
		}
	}
	// Trim trailing hyphen
	if len(result) > 0 && result[len(result)-1] == '-' {
		result = result[:len(result)-1]
	}
	return result
}

// GetUsersBySkill returns users by skill slug
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

// UpdateMySkills updates user's skills
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

// UpdateAvailability toggles user availability
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

	// Broadcast activity
	user, _ := h.store.GetUserByID(userID)
	activity, _ := h.store.CreateActivity("USER_AVAILABLE", userID, map[string]interface{}{
		"username":     user.Username,
		"display_name": user.DisplayName,
		"avatar_url":   user.AvatarURL,
		"available":    req.Available,
	})
	if activity != nil {
		h.hub.BroadcastActivity(activity)
	}

	c.JSON(http.StatusOK, gin.H{"available": req.Available})
}

// GetProjects returns all projects
// func (h *Handler) GetProjects(c *gin.Context) {
// 	projects, err := h.store.GetAllProjects()
// 	if err != nil {
// 		c.JSON(http.StatusOK, []models.Project{})
// 		return
// 	}

// 	// Auto-sync from Gitea if empty
// 	if len(projects) == 0 {
// 		userID := auth.GetUserID(c)
// 		token, err := h.store.GetUserToken(userID)
// 		if err == nil && token != "" {
// 			repos, err := h.giteaClient.GetUserRepos(token)
// 			if err == nil {
// 				for _, repo := range repos {
// 					// Skip private repos or specific patterns if needed
// 					h.store.CreateOrUpdateProject(repo.Name, slugify(repo.Name), "Gitea", repo.Description)
// 				}
// 				// Re-fetch after sync
// 				projects, _ = h.store.GetAllProjects()
// 			} else {
// 				log.Printf("[Projects] Gitea sync failed: %v", err)
// 			}
// 		}
// 	}

// 	c.JSON(http.StatusOK, projects)
// }

func (h *Handler) GetProjects(c *gin.Context) {
	projects, err := h.store.GetAllProjects()
	if err != nil {
		log.Printf("[Projects] DB error: %v", err)
		c.JSON(http.StatusOK, []models.Project{})
		return
	}
	log.Printf("[Projects] DB has %d projects", len(projects))

	// Auto-sync from Gitea if empty
	if len(projects) == 0 {
		log.Printf("[Projects] DB empty, attempting Gitea sync...")
		userID := auth.GetUserID(c)
		token, err := h.store.GetUserToken(userID)
		log.Printf("[Projects] Token found: %v, err: %v", token != "", err)
		
		if err == nil && token != "" {
			repos, err := h.giteaClient.GetUserRepos(token)
			log.Printf("[Projects] Gitea repos: %d, err: %v", len(repos), err)
			
			if err == nil {
    for i, repo := range repos {
        log.Printf("[Projects] Repo %d: %s", i, repo.Name)
        _, err := h.store.CreateOrUpdateProject(repo.Name, slugify(repo.Name), "Gitea", repo.Description)
        if err != nil {
            log.Printf("[Projects] Failed to save repo %s: %v", repo.Name, err)
        }
    }
    // Re-fetch after sync
    projects, _ = h.store.GetAllProjects()
    log.Printf("[Projects] After sync: %d projects", len(projects))
}
		}
	}

	c.JSON(http.StatusOK, projects)
}

// CreatePostMortem creates a new post-mortem
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
		"username":       user.Username,
		"display_name":   user.DisplayName,
		"project_name":   req.ProjectName,
		"post_mortem_id": pm.ID,
	})
	if activity != nil {
		h.hub.BroadcastActivity(activity)
	}

	c.JSON(http.StatusCreated, pm)
}

// GetPostMortems returns post-mortems with optional skill filter
func (h *Handler) GetPostMortems(c *gin.Context) {
	skillSlug := c.Query("skill")
	postMortems, err := h.store.GetPostMortems(skillSlug)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get post-mortems"})
		return
	}
	c.JSON(http.StatusOK, postMortems)
}

func (h *Handler) GetMyPostMortems(c *gin.Context) {
    userID := auth.GetUserID(c)
    postMortems, err := h.store.GetPostMortemsByUser(userID)
    if err != nil {
        c.JSON(http.StatusOK, []models.PostMortem{})
        return
    }
    c.JSON(http.StatusOK, postMortems)
}

// UpvotePostMortem upvotes a post-mortem
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

// GetActivities returns recent activities
func (h *Handler) GetActivities(c *gin.Context) {
	activities, err := h.store.GetRecentActivities(50)
	if err != nil {
		c.JSON(http.StatusOK, []models.Activity{})
		return
	}
	c.JSON(http.StatusOK, activities)
}

// Logout clears the auth cookie
func (h *Handler) Logout(c *gin.Context) {
	auth.ClearAuthCookie(c.Writer)
	c.JSON(http.StatusOK, gin.H{"message": "logged out"})
}

package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID          uuid.UUID `json:"id" db:"id"`
	GiteaID     int64     `json:"gitea_id" db:"gitea_id"`
	Username    string    `json:"username" db:"username"`
	DisplayName string    `json:"display_name" db:"display_name"`
	Email       string    `json:"email" db:"email"`
	AvatarURL   string    `json:"avatar_url" db:"avatar_url"`
	Cohort      string    `json:"cohort" db:"cohort"`
	Role        string    `json:"role" db:"role"`
	Available   bool      `json:"available" db:"available"`
	GiteaAccessToken string    `json:"-" db:"gitea_access_token"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type Skill struct {
	ID          uuid.UUID `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Slug        string    `json:"slug" db:"slug"`
	Category    string    `json:"category" db:"category"`
	Description string    `json:"description" db:"description"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

type UserSkill struct {
	UserID      uuid.UUID `json:"user_id" db:"user_id"`
	SkillID     uuid.UUID `json:"skill_id" db:"skill_id"`
	Proficiency string    `json:"proficiency" db:"proficiency"`
}

type Project struct {
	ID          uuid.UUID `json:"id" db:"id"`
	Edu01ID     string    `json:"edu01_id" db:"edu01_id"`
	Name        string    `json:"name" db:"name"`
	Slug        string    `json:"slug" db:"slug"`
	Module      string    `json:"module" db:"module"`
	Branch      string    `json:"branch" db:"branch"`
	Description string    `json:"description" db:"description"`
	Difficulty  int       `json:"difficulty" db:"difficulty"`
	XPReward    int       `json:"xp_reward" db:"xp_reward"`
	Status      string    `json:"status" db:"status"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

type PostMortem struct {
	ID          uuid.UUID `json:"id" db:"id"`
	UserID      uuid.UUID `json:"user_id" db:"user_id"`
	ProjectID   *uuid.UUID `json:"project_id" db:"project_id"`
	ProjectName string    `json:"project_name" db:"project_name"`
	GiteaRepo   string    `json:"gitea_repo" db:"gitea_repo"`
	Challenge   string    `json:"challenge" db:"challenge"`
	Solution    string    `json:"solution" db:"solution"`
	Regret      string    `json:"regret" db:"regret"`
	Tags        []string  `json:"tags" db:"tags"`
	Upvotes     int       `json:"upvotes" db:"upvotes"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type Activity struct {
	ID        uuid.UUID `json:"id" db:"id"`
	Type      string    `json:"type" db:"type"`
	UserID    uuid.UUID `json:"user_id" db:"user_id"`
	Payload   map[string]interface{} `json:"payload" db:"payload"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type GiteaUser struct {
	ID        int64  `json:"id"`
	Login     string `json:"login"`
	FullName  string `json:"full_name"`
	Email     string `json:"email"`
	AvatarURL string `json:"avatar_url"`
}

type CreatePostMortemRequest struct {
	ProjectID   *string  `json:"project_id"`
	ProjectName string   `json:"project_name"`
	GiteaRepo   string   `json:"gitea_repo"`
	Challenge   string   `json:"challenge" binding:"required"`
	Solution    string   `json:"solution" binding:"required"`
	Regret      string   `json:"regret"`
	Tags        []string `json:"tags"`
}

type UpdateSkillsRequest struct {
	Skills []struct {
		SkillID     string `json:"skill_id"`
		Proficiency string `json:"proficiency"`
	} `json:"skills"`
}

type UpdateAvailabilityRequest struct {
	Available bool `json:"available"`
}

type GiteaRepo struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	FullName    string `json:"full_name"`
	Description string `json:"description"`
	HTMLURL     string `json:"html_url"`
	Language    string `json:"language"`
	Private     bool   `json:"private"`
}

type Comment struct {
	ID           uuid.UUID `json:"id" db:"id"`
	PostMortemID uuid.UUID `json:"post_mortem_id" db:"post_mortem_id"`
	UserID       uuid.UUID `json:"user_id" db:"user_id"`
	Username     string    `json:"username" db:"username"`
	DisplayName  string    `json:"display_name" db:"display_name"`
	AvatarURL    string    `json:"avatar_url" db:"avatar_url"`
	Content      string    `json:"content" db:"content"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type CreateCommentRequest struct {
	Content string `json:"content" binding:"required"`
}

type HelpRequest struct {
	ID                 uuid.UUID `json:"id" db:"id"`
	RequesterID        uuid.UUID `json:"requester_id" db:"requester_id"`
	RequesterName      string    `json:"requester_name" db:"requester_name"`
	RequesterAvatarURL string    `json:"requester_avatar_url" db:"requester_avatar_url"`
	SkillID            uuid.UUID `json:"skill_id" db:"skill_id"`
	SkillName          string    `json:"skill_name" db:"skill_name"`
	ProjectID          string    `json:"project_id" db:"project_id"`
	ProjectName        string    `json:"project_name" db:"project_name"`
	Title              string    `json:"title" db:"title"`
	Description        string    `json:"description" db:"description"`
	Status             string    `json:"status" db:"status"`
	HelperID           string    `json:"helper_id" db:"helper_id"`
	HelperName         string    `json:"helper_name" db:"helper_name"`
	CreatedAt          time.Time `json:"created_at" db:"created_at"`
	ResolvedAt         string    `json:"resolved_at" db:"resolved_at"`
}

type CreateHelpRequestRequest struct {
	SkillID     string `json:"skill_id" binding:"required"`
	SkillName   string `json:"skill_name" binding:"required"`
	ProjectID   string `json:"project_id"`
	ProjectName string `json:"project_name"`
	Title       string `json:"title" binding:"required"`
	Description string `json:"description" binding:"required"`
}
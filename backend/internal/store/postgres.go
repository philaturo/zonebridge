package store

import (
	"database/sql"
	"encoding/json"
	"time"

	"zonebridge/internal/models"

	"github.com/google/uuid"
	_ "github.com/lib/pq"
)

type Store struct {
	db *sql.DB
}

func New(databaseURL string) (*Store, error) {
	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	return &Store{db: db}, nil
}

func (s *Store) Close() error {
	return s.db.Close()
}

func (s *Store) InitSchema() error {
	schema := `
	CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

	CREATE TABLE IF NOT EXISTS users (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		gitea_id BIGINT UNIQUE NOT NULL,
		username VARCHAR(255) UNIQUE NOT NULL,
		display_name VARCHAR(255),
		email VARCHAR(255),
		avatar_url TEXT,
		cohort VARCHAR(100),
		role VARCHAR(50) DEFAULT 'apprentice',
		available BOOLEAN DEFAULT false,
		created_at TIMESTAMP DEFAULT NOW(),
		updated_at TIMESTAMP DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS skills (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		name VARCHAR(255) UNIQUE NOT NULL,
		slug VARCHAR(255) UNIQUE NOT NULL,
		category VARCHAR(100),
		description TEXT,
		created_at TIMESTAMP DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS user_skills (
		user_id UUID REFERENCES users(id) ON DELETE CASCADE,
		skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
		proficiency VARCHAR(50) DEFAULT 'intermediate',
		PRIMARY KEY (user_id, skill_id)
	);

	CREATE TABLE IF NOT EXISTS projects (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		edu01_id VARCHAR(255) UNIQUE,
		name VARCHAR(255) NOT NULL,
		slug VARCHAR(255) UNIQUE NOT NULL,
		module VARCHAR(100),
		branch VARCHAR(100),
		description TEXT,
		 difficulty INT DEFAULT 0,
    xp_reward INT DEFAULT 0,
		status VARCHAR(50) DEFAULT 'available',
		created_at TIMESTAMP DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS post_mortems (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		user_id UUID REFERENCES users(id) ON DELETE CASCADE,
		project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
		project_name VARCHAR(255),
		gitea_repo TEXT,
		challenge TEXT NOT NULL,
		solution TEXT NOT NULL,
		regret TEXT,
		tags JSONB DEFAULT '[]',
		upvotes INT DEFAULT 0,
		created_at TIMESTAMP DEFAULT NOW(),
		updated_at TIMESTAMP DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS activities (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		type VARCHAR(100) NOT NULL,
		user_id UUID REFERENCES users(id) ON DELETE CASCADE,
		payload JSONB DEFAULT '{}',
		created_at TIMESTAMP DEFAULT NOW()
	);

		CREATE TABLE IF NOT EXISTS comments (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		post_mortem_id UUID REFERENCES post_mortems(id) ON DELETE CASCADE,
		user_id UUID REFERENCES users(id) ON DELETE CASCADE,
		content TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT NOW(),
		updated_at TIMESTAMP DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS help_requests (
		id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
		skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
		skill_name VARCHAR(255) NOT NULL,
		project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
		project_name VARCHAR(255),
		title VARCHAR(255) NOT NULL,
		description TEXT NOT NULL,
		status VARCHAR(50) DEFAULT 'open',
		helper_id UUID REFERENCES users(id) ON DELETE SET NULL,
		created_at TIMESTAMP DEFAULT NOW(),
		resolved_at TIMESTAMP
	);
	`

	_, err := s.db.Exec(schema)
	return err
}

// User operations
func (s *Store) CreateOrUpdateUser(giteaUser *models.GiteaUser) (*models.User, error) {
	var user models.User

	// Try to find existing user
	err := s.db.QueryRow(
		"SELECT id, gitea_id, username, display_name, email, avatar_url, cohort, role, available, gitea_access_token, created_at, updated_at FROM users WHERE gitea_id = $1",
		giteaUser.ID,
	).Scan(&user.ID, &user.GiteaID, &user.Username, &user.DisplayName, &user.Email, &user.AvatarURL, &user.Cohort, &user.Role, &user.Available, &user.GiteaAccessToken, &user.CreatedAt, &user.UpdatedAt)

	if err == sql.ErrNoRows {
		// Create new user
		err = s.db.QueryRow(
			`INSERT INTO users (gitea_id, username, display_name, email, avatar_url, cohort, role, gitea_access_token)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, '')
			 RETURNING id, gitea_id, username, display_name, email, avatar_url, cohort, role, available, gitea_access_token, created_at, updated_at`,
			giteaUser.ID, giteaUser.Login, giteaUser.FullName, giteaUser.Email, giteaUser.AvatarURL, "zone01-kisumu-c1", "apprentice",
		).Scan(&user.ID, &user.GiteaID, &user.Username, &user.DisplayName, &user.Email, &user.AvatarURL, &user.Cohort, &user.Role, &user.Available, &user.GiteaAccessToken, &user.CreatedAt, &user.UpdatedAt)
	} else if err != nil {
		return nil, err
	} else {
		// Update existing
		_, err = s.db.Exec(
			"UPDATE users SET username = $1, display_name = $2, email = $3, avatar_url = $4, updated_at = NOW() WHERE gitea_id = $5",
			giteaUser.Login, giteaUser.FullName, giteaUser.Email, giteaUser.AvatarURL, giteaUser.ID,
		)
		if err != nil {
			return nil, err
		}
	}

	return &user, nil
}

func (s *Store) UpdateUserToken(userID uuid.UUID, token string) error {
	_, err := s.db.Exec(
		"UPDATE users SET gitea_access_token = $1, updated_at = NOW() WHERE id = $2",
		token, userID,
	)
	return err
}

func (s *Store) GetUserToken(userID uuid.UUID) (string, error) {
	var token sql.NullString
	err := s.db.QueryRow(
		"SELECT gitea_access_token FROM users WHERE id = $1",
		userID,
	).Scan(&token)
	if err == sql.ErrNoRows {
		return "", nil
	}
	if err != nil {
		return "", err
	}
	if !token.Valid {
		return "", nil
	}
	return token.String, nil
}

func (s *Store) GetUserByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	err := s.db.QueryRow(
		"SELECT id, gitea_id, username, display_name, email, avatar_url, cohort, role, available, created_at, updated_at FROM users WHERE id = $1",
		id,
	).Scan(&user.ID, &user.GiteaID, &user.Username, &user.DisplayName, &user.Email, &user.AvatarURL, &user.Cohort, &user.Role, &user.Available, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *Store) UpdateAvailability(userID uuid.UUID, available bool) error {
	_, err := s.db.Exec(
		"UPDATE users SET available = $1, updated_at = NOW() WHERE id = $2",
		available, userID,
	)
	return err
}

// === ORGANIC SKILL CREATION ===

func (s *Store) CreateSkillIfNotExists(name, slug, category string) (*models.Skill, error) {
	var skill models.Skill

	// Try to find existing
	err := s.db.QueryRow(
		"SELECT id, name, slug, category, description, created_at FROM skills WHERE slug = $1",
		slug,
	).Scan(&skill.ID, &skill.Name, &skill.Slug, &skill.Category, &skill.Description, &skill.CreatedAt)

	if err == nil {
		return &skill, nil // Found existing
	}

	if err != sql.ErrNoRows {
		return nil, err // Real error
	}

	// Create new
	err = s.db.QueryRow(
    `INSERT INTO skills (name, slug, category, description)
     VALUES ($1, $2, $3, '')
     RETURNING id, name, slug, category, description, created_at`,
    name, slug, category,
).Scan(&skill.ID, &skill.Name, &skill.Slug, &skill.Category, &skill.Description, &skill.CreatedAt)

	return &skill, err
}

func (s *Store) UpdateUserSkills(userID uuid.UUID, skills []struct {
	SkillID     string `json:"skill_id"`
	Proficiency string `json:"proficiency"`
}) error {
	_, err := s.db.Exec("DELETE FROM user_skills WHERE user_id = $1", userID)
	if err != nil {
		return err
	}

	for _, skill := range skills {
		skillUUID, err := uuid.Parse(skill.SkillID)
		if err != nil {
			continue
		}
		_, err = s.db.Exec(
			"INSERT INTO user_skills (user_id, skill_id, proficiency) VALUES ($1, $2, $3)",
			userID, skillUUID, skill.Proficiency,
		)
		if err != nil {
			return err
		}
	}
	return nil
}

func (s *Store) GetUserSkills(userID uuid.UUID) ([]models.Skill, error) {
	rows, err := s.db.Query(
		`SELECT s.id, s.name, s.slug, s.category, s.description, s.created_at
		 FROM skills s
		 JOIN user_skills us ON s.id = us.skill_id
		 WHERE us.user_id = $1`,
		userID,
	)
	if err != nil {
		 return []models.Skill{}, nil
	}
	defer rows.Close()

	var skills = []models.Skill{}
	for rows.Next() {
		var s models.Skill
	if err := rows.Scan(&s.ID, &s.Name, &s.Slug, &s.Category, &s.Description, &s.CreatedAt); err != nil {
			continue
		}
		skills = append(skills, s)
	}
	return skills, nil
}

// === SKILL OPERATIONS ===

func (s *Store) GetAllSkills() ([]models.Skill, error) {
	rows, err := s.db.Query("SELECT id, name, slug, category, description, created_at FROM skills ORDER BY category, name")
	if err != nil {
		return []models.Skill{}, nil
	}
	defer rows.Close()

	var skills = []models.Skill{} 
	for rows.Next() {
		var skill models.Skill
		if err := rows.Scan(&skill.ID, &skill.Name, &skill.Slug, &skill.Category, &skill.Description, &skill.CreatedAt); err != nil {
			continue
		}
		skills = append(skills, skill)
	}
	if err := rows.Err(); err != nil {
		return []models.Skill{}, nil
	}
	return skills, nil
}

func (s *Store) GetUsersBySkill(slug string) ([]models.User, error) {
	rows, err := s.db.Query(
		`SELECT u.id, u.gitea_id, u.username, u.display_name, u.email, u.avatar_url, u.cohort, u.role, u.available, u.created_at, u.updated_at
		 FROM users u
		 JOIN user_skills us ON u.id = us.user_id
		 JOIN skills s ON us.skill_id = s.id
		 WHERE s.slug = $1 AND u.available = true
		 ORDER BY u.username`,
		slug,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users = []models.User{}
	for rows.Next() {
		var u models.User
		err := rows.Scan(&u.ID, &u.GiteaID, &u.Username, &u.DisplayName, &u.Email, &u.AvatarURL, &u.Cohort, &u.Role, &u.Available, &u.CreatedAt, &u.UpdatedAt)
		if err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}

// === PROJECT OPERATIONS (from Gitea or edu-01) ===

func (s *Store) CreateOrUpdateProject(name, slug, module, description string) (*models.Project, error) {
    var project models.Project

    // Use sql.NullString for nullable columns
    var edu01ID sql.NullString
    var branch sql.NullString

    err := s.db.QueryRow(
        "SELECT id, edu01_id, name, slug, module, branch, description, difficulty, xp_reward, status, created_at FROM projects WHERE slug = $1",
        slug,
    ).Scan(&project.ID, &edu01ID, &project.Name, &project.Slug, &project.Module, &branch, &project.Description, &project.Difficulty, &project.XPReward, &project.Status, &project.CreatedAt)

    if err == sql.ErrNoRows {
        err = s.db.QueryRow(
            `INSERT INTO projects (name, slug, module, description, difficulty, xp_reward)
             VALUES ($1, $2, $3, $4, 0, 0)
             RETURNING id, edu01_id, name, slug, module, branch, description, difficulty, xp_reward, status, created_at`,
            name, slug, module, description,
        ).Scan(&project.ID, &edu01ID, &project.Name, &project.Slug, &project.Module, &branch, &project.Description, &project.Difficulty, &project.XPReward, &project.Status, &project.CreatedAt)
    } else if err != nil {
        return nil, err
    }

    // Convert sql.NullString to string
    if edu01ID.Valid {
        project.Edu01ID = edu01ID.String
    }
    if branch.Valid {
        project.Branch = branch.String
    }

    return &project, nil
}

func (s *Store) GetAllProjects() ([]models.Project, error) {
    rows, err := s.db.Query("SELECT id, edu01_id, name, slug, module, branch, description, difficulty, xp_reward, status, created_at FROM projects ORDER BY module, name")
    if err != nil {
        return []models.Project{}, nil
    }
    defer rows.Close()

    var projects = []models.Project{} 
    for rows.Next() {
        var p models.Project
        var edu01ID sql.NullString
        var branch sql.NullString
        err := rows.Scan(&p.ID, &edu01ID, &p.Name, &p.Slug, &p.Module, &branch, &p.Description, &p.Difficulty, &p.XPReward, &p.Status, &p.CreatedAt)
        if err != nil {
            continue
        }
        if edu01ID.Valid {
            p.Edu01ID = edu01ID.String
        }
        if branch.Valid {
            p.Branch = branch.String
        }
        projects = append(projects, p)
    }
    return projects, nil
}

// === POST-MORTEM OPERATIONS ===

func (s *Store) CreatePostMortem(pm *models.PostMortem) error {
	tagsJSON, _ := json.Marshal(pm.Tags)
	err := s.db.QueryRow(
		`INSERT INTO post_mortems (user_id, project_id, project_name, gitea_repo, challenge, solution, regret, tags)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		 RETURNING id, upvotes, created_at, updated_at`,
		pm.UserID, pm.ProjectID, pm.ProjectName, pm.GiteaRepo, pm.Challenge, pm.Solution, pm.Regret, tagsJSON,
	).Scan(&pm.ID, &pm.Upvotes, &pm.CreatedAt, &pm.UpdatedAt)
	return err
}

func (s *Store) GetPostMortems(skillSlug string) ([]models.PostMortem, error) {
	var rows *sql.Rows
	var err error

	if skillSlug != "" {
		rows, err = s.db.Query(
			`SELECT id, user_id, project_id, project_name, gitea_repo, challenge, solution, regret, tags, upvotes, created_at, updated_at
			 FROM post_mortems
			 WHERE $1 = ANY(tags)
			 ORDER BY upvotes DESC, created_at DESC`,
			skillSlug,
		)
	} else {
		rows, err = s.db.Query(
			`SELECT id, user_id, project_id, project_name, gitea_repo, challenge, solution, regret, tags, upvotes, created_at, updated_at
			 FROM post_mortems
			 ORDER BY upvotes DESC, created_at DESC`,
		)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var postMortems = []models.PostMortem{}
	for rows.Next() {
		var pm models.PostMortem
		var tagsJSON []byte
		var projectID sql.NullString
		err := rows.Scan(&pm.ID, &pm.UserID, &projectID, &pm.ProjectName, &pm.GiteaRepo, &pm.Challenge, &pm.Solution, &pm.Regret, &tagsJSON, &pm.Upvotes, &pm.CreatedAt, &pm.UpdatedAt)
		if err != nil {
			return nil, err
		}
		if projectID.Valid {
			pid, _ := uuid.Parse(projectID.String)
			pm.ProjectID = &pid
		}
		json.Unmarshal(tagsJSON, &pm.Tags)
		postMortems = append(postMortems, pm)
	}
	return postMortems, nil
}

func (s *Store) GetPostMortemsByUser(userID uuid.UUID) ([]models.PostMortem, error) {
    rows, err := s.db.Query(
        `SELECT id, user_id, project_id, project_name, gitea_repo, challenge, solution, regret, tags, upvotes, created_at, updated_at
         FROM post_mortems
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        userID,
    )
    if err != nil {
        return []models.PostMortem{}, nil
    }
    defer rows.Close()

    var postMortems = []models.PostMortem{}
    for rows.Next() {
        var pm models.PostMortem
        var tagsJSON []byte
        var projectID sql.NullString
        if err := rows.Scan(&pm.ID, &pm.UserID, &projectID, &pm.ProjectName, &pm.GiteaRepo, &pm.Challenge, &pm.Solution, &pm.Regret, &tagsJSON, &pm.Upvotes, &pm.CreatedAt, &pm.UpdatedAt); err != nil {
            continue
        }
        if projectID.Valid {
            pid, _ := uuid.Parse(projectID.String)
            pm.ProjectID = &pid
        }
        json.Unmarshal(tagsJSON, &pm.Tags)
        postMortems = append(postMortems, pm)
    }
    return postMortems, nil
}

func (s *Store) UpvotePostMortem(id uuid.UUID) error {
	_, err := s.db.Exec("UPDATE post_mortems SET upvotes = upvotes + 1 WHERE id = $1", id)
	return err
}

// === ACTIVITY OPERATIONS ===

func (s *Store) CreateActivity(activityType string, userID uuid.UUID, payload map[string]interface{}) (*models.Activity, error) {
	payloadJSON, _ := json.Marshal(payload)
	var activity models.Activity
	err := s.db.QueryRow(
		`INSERT INTO activities (type, user_id, payload)
		 VALUES ($1, $2, $3)
		 RETURNING id, type, user_id, payload, created_at`,
		activityType, userID, payloadJSON,
	).Scan(&activity.ID, &activity.Type, &activity.UserID, &payloadJSON, &activity.CreatedAt)
	if err != nil {
		return nil, err
	}
	json.Unmarshal(payloadJSON, &activity.Payload)
	return &activity, nil
}

func (s *Store) GetRecentActivities(limit int) ([]models.Activity, error) {
	rows, err := s.db.Query(
		`SELECT a.id, a.type, a.user_id, a.payload, a.created_at,
		        u.username, u.display_name, u.avatar_url
		 FROM activities a
		 JOIN users u ON a.user_id = u.id
		 ORDER BY a.created_at DESC
		 LIMIT $1`,
		limit,
	)
	if err != nil {
		return []models.Activity{}, nil 
	}
	defer rows.Close()

	var activities =[]models.Activity{}
	for rows.Next() {
		var a models.Activity
		var payloadJSON []byte
		var username, displayName, avatarURL string
			if err := rows.Scan(&a.ID, &a.Type, &a.UserID, &payloadJSON, &a.CreatedAt, &username, &displayName, &avatarURL); err != nil {
			continue  // ← Skip bad row, don't crash
		}
		json.Unmarshal(payloadJSON, &a.Payload)
		a.Payload["username"] = username
		a.Payload["display_name"] = displayName
		a.Payload["avatar_url"] = avatarURL
		activities = append(activities, a)
	}
	if err := rows.Err(); err != nil {
		return []models.Activity{}, nil
	}
	return activities, nil
}
// === USER LIST OPERATIONS ===

func (s *Store) GetAllUsers() ([]models.User, error) {
	rows, err := s.db.Query(
		"SELECT id, gitea_id, username, display_name, email, avatar_url, cohort, role, available, created_at, updated_at FROM users ORDER BY username",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users = []models.User{}
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.GiteaID, &u.Username, &u.DisplayName, &u.Email, &u.AvatarURL, &u.Cohort, &u.Role, &u.Available, &u.CreatedAt, &u.UpdatedAt); err != nil {
			continue
		}
		users = append(users, u)
	}
	return users, nil
}

func (s *Store) GetAvailableUsers() ([]models.User, error) {
	rows, err := s.db.Query(
		"SELECT id, gitea_id, username, display_name, email, avatar_url, cohort, role, available, created_at, updated_at FROM users WHERE available = true ORDER BY username",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users = []models.User{}
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.GiteaID, &u.Username, &u.DisplayName, &u.Email, &u.AvatarURL, &u.Cohort, &u.Role, &u.Available, &u.CreatedAt, &u.UpdatedAt); err != nil {
			continue
		}
		users = append(users, u)
	}
	return users, nil
}

// === COMMENT OPERATIONS ===

func (s *Store) GetCommentsByPostMortem(postMortemID string) ([]models.Comment, error) {
	rows, err := s.db.Query(
		`SELECT c.id, c.post_mortem_id, c.user_id, u.username, u.display_name, u.avatar_url, c.content, c.created_at, c.updated_at
		 FROM comments c
		 JOIN users u ON c.user_id = u.id
		 WHERE c.post_mortem_id = $1
		 ORDER BY c.created_at ASC`,
		postMortemID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments = []models.Comment{}
	for rows.Next() {
		var c models.Comment
		if err := rows.Scan(&c.ID, &c.PostMortemID, &c.UserID, &c.Username, &c.DisplayName, &c.AvatarURL, &c.Content, &c.CreatedAt, &c.UpdatedAt); err != nil {
			continue
		}
		comments = append(comments, c)
	}
	return comments, nil
}

func (s *Store) CreateComment(postMortemID string, userID uuid.UUID, content string) (*models.Comment, error) {
	var comment models.Comment
	err := s.db.QueryRow(
		`INSERT INTO comments (post_mortem_id, user_id, content)
		 VALUES ($1, $2, $3)
		 RETURNING id, post_mortem_id, user_id, content, created_at, updated_at`,
		postMortemID, userID, content,
	).Scan(&comment.ID, &comment.PostMortemID, &comment.UserID, &comment.Content, &comment.CreatedAt, &comment.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &comment, nil
}

// === HELP REQUEST OPERATIONS ===

func (s *Store) GetHelpRequests(status string) ([]models.HelpRequest, error) {
	var rows *sql.Rows
	var err error

	if status != "" {
		rows, err = s.db.Query(
			`SELECT h.id, h.requester_id, u.username as requester_name, u.avatar_url as requester_avatar_url,
			        h.skill_id, h.skill_name, h.project_id, h.project_name, h.title, h.description,
			        h.status, h.helper_id, uh.username as helper_name, h.created_at, h.resolved_at
			 FROM help_requests h
			 JOIN users u ON h.requester_id = u.id
			 LEFT JOIN users uh ON h.helper_id = uh.id
			 WHERE h.status = $1
			 ORDER BY h.created_at DESC`,
			status,
		)
	} else {
		rows, err = s.db.Query(
			`SELECT h.id, h.requester_id, u.username as requester_name, u.avatar_url as requester_avatar_url,
			        h.skill_id, h.skill_name, h.project_id, h.project_name, h.title, h.description,
			        h.status, h.helper_id, uh.username as helper_name, h.created_at, h.resolved_at
			 FROM help_requests h
			 JOIN users u ON h.requester_id = u.id
			 LEFT JOIN users uh ON h.helper_id = uh.id
			 ORDER BY h.created_at DESC`,
		)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var requests = []models.HelpRequest{}
	for rows.Next() {
		var hr models.HelpRequest
		var projectID, projectName, helperID, helperName sql.NullString
		var resolvedAt sql.NullTime
		if err := rows.Scan(&hr.ID, &hr.RequesterID, &hr.RequesterName, &hr.RequesterAvatarURL, &hr.SkillID, &hr.SkillName, &projectID, &projectName, &hr.Title, &hr.Description, &hr.Status, &helperID, &helperName, &hr.CreatedAt, &resolvedAt); err != nil {
			continue
		}
		if projectID.Valid {
			hr.ProjectID = projectID.String
		}
		if projectName.Valid {
			hr.ProjectName = projectName.String
		}
		if helperID.Valid {
			hr.HelperID = helperID.String
		}
		if helperName.Valid {
			hr.HelperName = helperName.String
		}
		if resolvedAt.Valid {
			hr.ResolvedAt = resolvedAt.Time.Format(time.RFC3339)
		}
		requests = append(requests, hr)
	}
	return requests, nil
}

func (s *Store) CreateHelpRequest(userID uuid.UUID, req *models.CreateHelpRequestRequest) (*models.HelpRequest, error) {
	var hr models.HelpRequest
	var projectID interface{}
	if req.ProjectID != "" {
		projectID = req.ProjectID
	} else {
		projectID = nil
	}

	err := s.db.QueryRow(
		`INSERT INTO help_requests (requester_id, skill_id, skill_name, project_id, project_name, title, description)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 RETURNING id, requester_id, skill_id, skill_name, project_id, project_name, title, description, status, helper_id, created_at`,
		userID, req.SkillID, req.SkillName, projectID, req.ProjectName, req.Title, req.Description,
	).Scan(&hr.ID, &hr.RequesterID, &hr.SkillID, &hr.SkillName, &projectID, &hr.ProjectName, &hr.Title, &hr.Description, &hr.Status, &hr.HelperID, &hr.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &hr, nil
}

func (s *Store) AcceptHelpRequest(id string, helperID uuid.UUID) (*models.HelpRequest, error) {
	_, err := s.db.Exec(
		"UPDATE help_requests SET status = 'accepted', helper_id = $1 WHERE id = $2",
		helperID, id,
	)
	if err != nil {
		return nil, err
	}
	return s.getHelpRequestByID(id)
}

func (s *Store) ResolveHelpRequest(id string) (*models.HelpRequest, error) {
	_, err := s.db.Exec(
		"UPDATE help_requests SET status = 'resolved', resolved_at = NOW() WHERE id = $1",
		id,
	)
	if err != nil {
		return nil, err
	}
	return s.getHelpRequestByID(id)
}

func (s *Store) getHelpRequestByID(id string) (*models.HelpRequest, error) {
	var hr models.HelpRequest
	var projectID, projectName, helperID, helperName sql.NullString
	var resolvedAt sql.NullTime

	err := s.db.QueryRow(
		`SELECT h.id, h.requester_id, u.username as requester_name, u.avatar_url as requester_avatar_url,
		        h.skill_id, h.skill_name, h.project_id, h.project_name, h.title, h.description,
		        h.status, h.helper_id, uh.username as helper_name, h.created_at, h.resolved_at
		 FROM help_requests h
		 JOIN users u ON h.requester_id = u.id
		 LEFT JOIN users uh ON h.helper_id = uh.id
		 WHERE h.id = $1`,
		id,
	).Scan(&hr.ID, &hr.RequesterID, &hr.RequesterName, &hr.RequesterAvatarURL, &hr.SkillID, &hr.SkillName, &projectID, &projectName, &hr.Title, &hr.Description, &hr.Status, &helperID, &helperName, &hr.CreatedAt, &resolvedAt)

	if err != nil {
		return nil, err
	}
	if projectID.Valid {
		hr.ProjectID = projectID.String
	}
	if projectName.Valid {
		hr.ProjectName = projectName.String
	}
	if helperID.Valid {
		hr.HelperID = helperID.String
	}
	if helperName.Valid {
		hr.HelperName = helperName.String
	}
	if resolvedAt.Valid {
		hr.ResolvedAt = resolvedAt.Time.Format(time.RFC3339)
	}
	return &hr, nil
}
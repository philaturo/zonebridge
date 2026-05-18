package client

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"

	"zonebridge/internal/config"
	"zonebridge/internal/models"
)

type GiteaClient struct {
	baseURL    string
	httpClient *http.Client
}

func NewGiteaClient(cfg *config.Config) *GiteaClient {
	return &GiteaClient{
		baseURL:    cfg.GiteaURL,
		httpClient: &http.Client{},
	}
}

func (c *GiteaClient) GetOAuthURL(clientID, redirectURI string) string {
	params := url.Values{}
	params.Set("client_id", clientID)
	params.Set("redirect_uri", redirectURI)
	params.Set("response_type", "code")
	params.Set("scope", "read:user repo")
	//params.Set("scope", "read:user repo read:org")

	return fmt.Sprintf("%s/login/oauth/authorize?%s", c.baseURL, params.Encode())
}

func (c *GiteaClient) ExchangeCodeForToken(code, clientID, clientSecret, redirectURI string) (string, error) {
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("code", code)
	data.Set("client_id", clientID)
	data.Set("client_secret", clientSecret)
	data.Set("redirect_uri", redirectURI)

	resp, err := c.httpClient.PostForm(
		fmt.Sprintf("%s/login/oauth/access_token", c.baseURL),
		data,
	)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var result struct {
		AccessToken string `json:"access_token"`
		TokenType   string `json:"token_type"`
		Error       string `json:"error"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return "", err
	}

	if result.Error != "" {
		return "", fmt.Errorf("oauth error: %s", result.Error)
	}

	return result.AccessToken, nil
}

func (c *GiteaClient) GetUser(accessToken string) (*models.GiteaUser, error) {
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/v1/user", c.baseURL), nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("gitea API error %d: %s", resp.StatusCode, string(body))
	}

	var user models.GiteaUser
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, err
	}

	return &user, nil
}

func (c *GiteaClient) GetUserRepos(accessToken string) ([]models.GiteaRepo, error) {
	allRepos := make(map[int64]models.GiteaRepo)
	types := []string{"", "collaborative", "organization"}
	
	for _, t := range types {
		log.Printf("[Gitea] Fetching repos with type=%s", t)
		repos, err := c.fetchReposByType(accessToken, t)
		if err != nil {
			log.Printf("[Gitea] Failed type=%s: %v", t, err)
			continue
		}
		log.Printf("[Gitea] Type=%s returned %d repos", t, len(repos))
		for _, r := range repos {
			allRepos[r.ID] = r
		}
	}
	
	result := make([]models.GiteaRepo, 0, len(allRepos))
	for _, r := range allRepos {
		result = append(result, r)
	}
	log.Printf("[Gitea] Total unique repos: %d", len(result))
	
	return result, nil
}

func (c *GiteaClient) fetchReposByType(accessToken, repoType string) ([]models.GiteaRepo, error) {
	url := fmt.Sprintf("%s/api/v1/user/repos?limit=1000", c.baseURL)
	if repoType != "" {
		url = fmt.Sprintf("%s&type=%s", url, repoType)
	}
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("gitea API error %d: %s", resp.StatusCode, string(body))
	}
	
	var repos []models.GiteaRepo
	if err := json.NewDecoder(resp.Body).Decode(&repos); err != nil {
		return nil, err
	}
	return repos, nil
}
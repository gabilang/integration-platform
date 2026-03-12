package openchoreo

import (
	"context"
	"fmt"
	"net/http"

	"github.com/gabilang/integration-platform/integration-platform-service/clients/requests"
	"github.com/gabilang/integration-platform/integration-platform-service/models"
)

// ProjectClient defines operations for managing OpenChoreo projects.
type ProjectClient interface {
	ListProjects(ctx context.Context, orgName string, limit int, cursor string) (*models.ProjectList, error)
	GetProject(ctx context.Context, orgName, projectName string) (*models.Project, error)
	CreateProject(ctx context.Context, orgName string, req *models.CreateProjectRequest) (*models.Project, error)
	UpdateProject(ctx context.Context, orgName, projectName string, req *models.UpdateProjectRequest) (*models.Project, error)
	DeleteProject(ctx context.Context, orgName, projectName string) error
}

type projectClient struct {
	baseURL    string
	token      string
	httpClient *http.Client
}

// NewProjectClient creates a new OpenChoreo project client.
// baseURL is the OpenChoreo API base URL (e.g. http://host/wso2cloud-dp).
// token is the Bearer token used for authentication (optional).
func NewProjectClient(baseURL, token string) ProjectClient {
	return &projectClient{
		baseURL:    baseURL,
		token:      token,
		httpClient: &http.Client{},
	}
}

func (c *projectClient) projectsURL(orgName string) string {
	return fmt.Sprintf("%s/namespaces/%s/projects", c.baseURL, orgName)
}

func (c *projectClient) newRequest(name, method, url string) *requests.HttpRequest {
	req := requests.NewRequest(name, method, url)
	if c.token != "" {
		req.SetHeader("Authorization", "Bearer "+c.token)
	}
	return req
}

func (c *projectClient) ListProjects(ctx context.Context, orgName string, limit int, cursor string) (*models.ProjectList, error) {
	req := c.newRequest("openchoreo.ListProjects", http.MethodGet, c.projectsURL(orgName))
	if limit > 0 {
		req.SetQuery("limit", fmt.Sprintf("%d", limit))
	}
	if cursor != "" {
		req.SetQuery("cursor", cursor)
	}

	result := requests.SendRequest(ctx, c.httpClient, req)
	var list models.ProjectList
	if err := result.ScanResponse(&list, http.StatusOK); err != nil {
		return nil, fmt.Errorf("list projects: %w", err)
	}
	return &list, nil
}

func (c *projectClient) GetProject(ctx context.Context, orgName, projectName string) (*models.Project, error) {
	url := fmt.Sprintf("%s/%s", c.projectsURL(orgName), projectName)
	req := c.newRequest("openchoreo.GetProject", http.MethodGet, url)

	result := requests.SendRequest(ctx, c.httpClient, req)
	var project models.Project
	if err := result.ScanResponse(&project, http.StatusOK); err != nil {
		return nil, fmt.Errorf("get project: %w", err)
	}
	return &project, nil
}

func (c *projectClient) CreateProject(ctx context.Context, orgName string, body *models.CreateProjectRequest) (*models.Project, error) {
	req := c.newRequest("openchoreo.CreateProject", http.MethodPost, c.projectsURL(orgName))
	req.SetJSON(body)

	result := requests.SendRequest(ctx, c.httpClient, req)
	var project models.Project
	if err := result.ScanResponse(&project, http.StatusCreated); err != nil {
		return nil, fmt.Errorf("create project: %w", err)
	}
	return &project, nil
}

func (c *projectClient) UpdateProject(ctx context.Context, orgName, projectName string, body *models.UpdateProjectRequest) (*models.Project, error) {
	url := fmt.Sprintf("%s/%s", c.projectsURL(orgName), projectName)
	req := c.newRequest("openchoreo.UpdateProject", http.MethodPut, url)
	req.SetJSON(body)

	result := requests.SendRequest(ctx, c.httpClient, req)
	var project models.Project
	if err := result.ScanResponse(&project, http.StatusOK); err != nil {
		return nil, fmt.Errorf("update project: %w", err)
	}
	return &project, nil
}

func (c *projectClient) DeleteProject(ctx context.Context, orgName, projectName string) error {
	url := fmt.Sprintf("%s/%s", c.projectsURL(orgName), projectName)
	req := c.newRequest("openchoreo.DeleteProject", http.MethodDelete, url)

	result := requests.SendRequest(ctx, c.httpClient, req)
	if err := result.ScanResponse(nil, http.StatusNoContent); err != nil {
		return fmt.Errorf("delete project: %w", err)
	}
	return nil
}

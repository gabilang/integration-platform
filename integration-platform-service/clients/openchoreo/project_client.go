package openchoreo

import (
	"context"
	"fmt"
	"net/http"

	"github.com/gabilang/integration-platform/integration-platform-service/clients/requests"
	"github.com/gabilang/integration-platform/integration-platform-service/middleware"
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
	httpClient *http.Client
}

// NewProjectClient creates a new OpenChoreo project client.
// baseURL is the OpenChoreo API base URL (e.g. http://host/wso2cloud-dp).
// The Bearer token is read from the request context on each call.
func NewProjectClient(baseURL string) ProjectClient {
	return &projectClient{
		baseURL:    baseURL,
		httpClient: &http.Client{},
	}
}

func (c *projectClient) projectsURL() string {
	return c.baseURL + "/projects"
}

func (c *projectClient) projectURL(projectName string) string {
	return fmt.Sprintf("%s/projects/%s", c.baseURL, projectName)
}

func (c *projectClient) newRequest(ctx context.Context, name, method, url string) *requests.HttpRequest {
	req := requests.NewRequest(name, method, url)
	if token := middleware.GetAuthToken(ctx); token != "" {
		req.SetHeader("Authorization", "Bearer "+token)
	}
	return req
}

// platformListResponse is the envelope returned by the platform-api-service for list endpoints.
type platformListResponse struct {
	Data models.ProjectList `json:"data"`
}

// platformItemResponse is the envelope returned by the platform-api-service for single-item endpoints.
type platformItemResponse struct {
	Data models.Project `json:"data"`
}

func (c *projectClient) ListProjects(ctx context.Context, _ string, limit int, cursor string) (*models.ProjectList, error) {
	req := c.newRequest(ctx, "openchoreo.ListProjects", http.MethodGet, c.projectsURL())
	if limit > 0 {
		req.SetQuery("limit", fmt.Sprintf("%d", limit))
	}
	if cursor != "" {
		req.SetQuery("cursor", cursor)
	}

	result := requests.SendRequest(ctx, c.httpClient, req)
	var envelope platformListResponse
	if err := result.ScanResponse(&envelope, http.StatusOK); err != nil {
		return nil, fmt.Errorf("list projects: %w", err)
	}
	return &envelope.Data, nil
}

func (c *projectClient) GetProject(ctx context.Context, _, projectName string) (*models.Project, error) {
	req := c.newRequest(ctx, "openchoreo.GetProject", http.MethodGet, c.projectURL(projectName))

	result := requests.SendRequest(ctx, c.httpClient, req)
	var envelope platformItemResponse
	if err := result.ScanResponse(&envelope, http.StatusOK); err != nil {
		return nil, fmt.Errorf("get project: %w", err)
	}
	return &envelope.Data, nil
}

func (c *projectClient) CreateProject(ctx context.Context, _ string, body *models.CreateProjectRequest) (*models.Project, error) {
	req := c.newRequest(ctx, "openchoreo.CreateProject", http.MethodPost, c.projectsURL())
	req.SetJSON(body)

	result := requests.SendRequest(ctx, c.httpClient, req)
	var envelope platformItemResponse
	if err := result.ScanResponse(&envelope, http.StatusCreated); err != nil {
		return nil, fmt.Errorf("create project: %w", err)
	}
	return &envelope.Data, nil
}

func (c *projectClient) UpdateProject(ctx context.Context, _, projectName string, body *models.UpdateProjectRequest) (*models.Project, error) {
	req := c.newRequest(ctx, "openchoreo.UpdateProject", http.MethodPut, c.projectURL(projectName))
	req.SetJSON(body)

	result := requests.SendRequest(ctx, c.httpClient, req)
	var envelope platformItemResponse
	if err := result.ScanResponse(&envelope, http.StatusOK); err != nil {
		return nil, fmt.Errorf("update project: %w", err)
	}
	return &envelope.Data, nil
}

func (c *projectClient) DeleteProject(ctx context.Context, _, projectName string) error {
	req := c.newRequest(ctx, "openchoreo.DeleteProject", http.MethodDelete, c.projectURL(projectName))

	result := requests.SendRequest(ctx, c.httpClient, req)
	if err := result.ScanResponse(nil, http.StatusNoContent); err != nil {
		return fmt.Errorf("delete project: %w", err)
	}
	return nil
}

package openchoreo

import (
	"context"
	"fmt"
	"net/http"

	"github.com/gabilang/integration-platform/integration-platform-service/clients/requests"
	"github.com/gabilang/integration-platform/integration-platform-service/middleware"
	"github.com/gabilang/integration-platform/integration-platform-service/models"
)

// ComponentClient defines operations for managing OpenChoreo components.
type ComponentClient interface {
	ListComponents(ctx context.Context, orgName, projectName string, limit int, cursor string) (*models.ComponentList, error)
	CreateComponent(ctx context.Context, orgName, projectName string, req *models.CreateComponentRequest) (*models.Component, error)
	UpdateBuildParameters(ctx context.Context, orgName, projectName, componentName string, req *models.UpdateBuildParametersRequest) (*models.Component, error)
	TriggerBuild(ctx context.Context, orgName, projectName, componentName string) (*models.WorkflowRun, error)
	ListWorkflowRuns(ctx context.Context, orgName, projectName, componentName string, limit int, cursor string) (*models.WorkflowRunList, error)
	GetWorkflowRun(ctx context.Context, orgName, projectName, componentName, runName string) (*models.WorkflowRun, error)
}

type componentClient struct {
	baseURL    string
	httpClient *http.Client
}

// NewComponentClient creates a new OpenChoreo component client.
func NewComponentClient(baseURL string) ComponentClient {
	return &componentClient{
		baseURL:    baseURL,
		httpClient: &http.Client{},
	}
}

func (c *componentClient) componentsURL(projectName string) string {
	return fmt.Sprintf("%s/projects/%s/components", c.baseURL, projectName)
}

func (c *componentClient) componentURL(projectName, componentName string) string {
	return fmt.Sprintf("%s/projects/%s/components/%s", c.baseURL, projectName, componentName)
}

func (c *componentClient) workflowRunsURL(projectName, componentName string) string {
	return fmt.Sprintf("%s/projects/%s/components/%s/workflow-runs", c.baseURL, projectName, componentName)
}

func (c *componentClient) workflowRunURL(projectName, componentName, runName string) string {
	return fmt.Sprintf("%s/projects/%s/components/%s/workflow-runs/%s", c.baseURL, projectName, componentName, runName)
}

func (c *componentClient) newRequest(ctx context.Context, name, method, url string) *requests.HttpRequest {
	req := requests.NewRequest(name, method, url)
	if token := middleware.GetAuthToken(ctx); token != "" {
		req.SetHeader("Authorization", "Bearer "+token)
	}
	return req
}

// platformComponentListResponse is the envelope for component list responses.
type platformComponentListResponse struct {
	Data models.ComponentList `json:"data"`
}

// platformComponentResponse is the envelope for single-component responses.
type platformComponentResponse struct {
	Data models.Component `json:"data"`
}

// platformWorkflowRunResponse is the envelope for workflow run responses.
type platformWorkflowRunResponse struct {
	Data models.WorkflowRun `json:"data"`
}

// platformWorkflowRunListResponse is the envelope for workflow run list responses.
type platformWorkflowRunListResponse struct {
	Data models.WorkflowRunList `json:"data"`
}

// ListComponents returns all components belonging to the given project.
func (c *componentClient) ListComponents(ctx context.Context, _, projectName string, limit int, cursor string) (*models.ComponentList, error) {
	req := c.newRequest(ctx, "openchoreo.ListComponents", http.MethodGet, c.componentsURL(projectName))
	if limit > 0 {
		req.SetQuery("limit", fmt.Sprintf("%d", limit))
	}
	if cursor != "" {
		req.SetQuery("cursor", cursor)
	}

	result := requests.SendRequest(ctx, c.httpClient, req)
	var envelope platformComponentListResponse
	if err := result.ScanResponse(&envelope, http.StatusOK); err != nil {
		return nil, fmt.Errorf("list components: %w", err)
	}
	return &envelope.Data, nil
}

// CreateComponent creates a component in the platform-api-service.
// The request body is forwarded as-is (same format as the platform-api-service expects).
// The component is expected to have autoDeploy=true so OpenChoreo automatically deploys
// it to the default environment once the build succeeds.
func (c *componentClient) CreateComponent(ctx context.Context, _, projectName string, req *models.CreateComponentRequest) (*models.Component, error) {
	httpReq := c.newRequest(ctx, "openchoreo.CreateComponent", http.MethodPost, c.componentsURL(projectName))
	httpReq.SetJSON(req)

	result := requests.SendRequest(ctx, c.httpClient, httpReq)
	var envelope platformComponentResponse
	if err := result.ScanResponse(&envelope, http.StatusCreated); err != nil {
		return nil, fmt.Errorf("create component: %w", err)
	}
	return &envelope.Data, nil
}

// UpdateBuildParameters patches the component's workflow configuration (repository, build type, parameters).
func (c *componentClient) UpdateBuildParameters(ctx context.Context, _, projectName, componentName string, req *models.UpdateBuildParametersRequest) (*models.Component, error) {
	httpReq := c.newRequest(ctx, "openchoreo.UpdateBuildParameters", http.MethodPut, c.componentURL(projectName, componentName))
	httpReq.SetJSON(req)

	result := requests.SendRequest(ctx, c.httpClient, httpReq)
	var envelope platformComponentResponse
	if err := result.ScanResponse(&envelope, http.StatusOK); err != nil {
		return nil, fmt.Errorf("update build parameters: %w", err)
	}
	return &envelope.Data, nil
}

// TriggerBuild triggers an initial (or manual) build workflow run for the component.
func (c *componentClient) TriggerBuild(ctx context.Context, _, projectName, componentName string) (*models.WorkflowRun, error) {
	httpReq := c.newRequest(ctx, "openchoreo.TriggerBuild", http.MethodPost, c.workflowRunsURL(projectName, componentName))
	httpReq.SetJSON(map[string]any{})

	result := requests.SendRequest(ctx, c.httpClient, httpReq)
	var envelope platformWorkflowRunResponse
	if err := result.ScanResponse(&envelope, http.StatusCreated); err != nil {
		return nil, fmt.Errorf("trigger build: %w", err)
	}
	return &envelope.Data, nil
}

// ListWorkflowRuns returns all workflow runs for the given component.
func (c *componentClient) ListWorkflowRuns(ctx context.Context, _, projectName, componentName string, limit int, cursor string) (*models.WorkflowRunList, error) {
	httpReq := c.newRequest(ctx, "openchoreo.ListWorkflowRuns", http.MethodGet, c.workflowRunsURL(projectName, componentName))
	if limit > 0 {
		httpReq.SetQuery("limit", fmt.Sprintf("%d", limit))
	}
	if cursor != "" {
		httpReq.SetQuery("cursor", cursor)
	}

	result := requests.SendRequest(ctx, c.httpClient, httpReq)
	var envelope platformWorkflowRunListResponse
	if err := result.ScanResponse(&envelope, http.StatusOK); err != nil {
		return nil, fmt.Errorf("list workflow runs: %w", err)
	}
	return &envelope.Data, nil
}

// GetWorkflowRun returns a specific workflow run for the given component.
func (c *componentClient) GetWorkflowRun(ctx context.Context, _, projectName, componentName, runName string) (*models.WorkflowRun, error) {
	httpReq := c.newRequest(ctx, "openchoreo.GetWorkflowRun", http.MethodGet, c.workflowRunURL(projectName, componentName, runName))

	result := requests.SendRequest(ctx, c.httpClient, httpReq)
	var envelope platformWorkflowRunResponse
	if err := result.ScanResponse(&envelope, http.StatusOK); err != nil {
		return nil, fmt.Errorf("get workflow run: %w", err)
	}
	return &envelope.Data, nil
}

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
	CreateServiceComponent(ctx context.Context, orgName, projectName string, req *models.CreateServiceComponentRequest) (*models.Component, error)
	TriggerBuild(ctx context.Context, orgName, projectName, componentName string) (*models.WorkflowRun, error)
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

func (c *componentClient) workflowRunsURL(projectName, componentName string) string {
	return fmt.Sprintf("%s/projects/%s/components/%s/workflow-runs", c.baseURL, projectName, componentName)
}

func (c *componentClient) newRequest(ctx context.Context, name, method, url string) *requests.HttpRequest {
	req := requests.NewRequest(name, method, url)
	if token := middleware.GetAuthToken(ctx); token != "" {
		req.SetHeader("Authorization", "Bearer "+token)
	}
	return req
}

// platformComponentResponse is the envelope for single-component responses.
type platformComponentResponse struct {
	Data models.Component `json:"data"`
}

// platformWorkflowRunResponse is the envelope for workflow run responses.
type platformWorkflowRunResponse struct {
	Data models.WorkflowRun `json:"data"`
}

// ocWorkflowRevision is the git revision for the build workflow.
type ocWorkflowRevision struct {
	Branch string `json:"branch,omitempty"`
}

// ocWorkflowRepository is the repository config embedded in the workflow.
type ocWorkflowRepository struct {
	URL      string              `json:"url"`
	AppPath  string              `json:"appPath,omitempty"`
	Revision *ocWorkflowRevision `json:"revision,omitempty"`
}

// ocWorkflowSystemParameters holds system-level parameters for the build workflow.
type ocWorkflowSystemParameters struct {
	Repository *ocWorkflowRepository `json:"repository,omitempty"`
}

// ocWorkflowConfig describes the build workflow to associate with the component.
type ocWorkflowConfig struct {
	WorkflowName     string                      `json:"workflowName"`
	SystemParameters *ocWorkflowSystemParameters `json:"systemParameters,omitempty"`
	Parameters       map[string]any              `json:"parameters,omitempty"`
}

// ocCreateComponentRequest is the body sent to the platform-api-service.
type ocCreateComponentRequest struct {
	Name        string            `json:"name"`
	DisplayName string            `json:"displayName,omitempty"`
	Description string            `json:"description,omitempty"`
	Type        string            `json:"type"`
	ProjectName string            `json:"projectName"`
	AutoDeploy  bool              `json:"autoDeploy"`
	Parameters  map[string]any    `json:"parameters,omitempty"`
	Workflow    *ocWorkflowConfig `json:"workflow,omitempty"`
}

const (
	componentTypeService    = "service"
	workflowBuildpack       = "buildpack-build"
	workflowDocker          = "docker-build"
	defaultBranch           = "main"
	defaultAppPath          = "./"
)

// CreateServiceComponent creates a service-type component in the platform-api-service.
// The component is created with autoDeploy=true so OpenChoreo automatically
// deploys it to the default environment once the build succeeds.
func (c *componentClient) CreateServiceComponent(ctx context.Context, _, projectName string, req *models.CreateServiceComponentRequest) (*models.Component, error) {
	body := buildCreateComponentRequest(projectName, req)

	httpReq := c.newRequest(ctx, "openchoreo.CreateServiceComponent", http.MethodPost, c.componentsURL(projectName))
	httpReq.SetJSON(body)

	result := requests.SendRequest(ctx, c.httpClient, httpReq)
	var envelope platformComponentResponse
	if err := result.ScanResponse(&envelope, http.StatusCreated); err != nil {
		return nil, fmt.Errorf("create service component: %w", err)
	}
	return &envelope.Data, nil
}

// TriggerBuild triggers an initial (or manual) build workflow run for the component.
func (c *componentClient) TriggerBuild(ctx context.Context, _, projectName, componentName string) (*models.WorkflowRun, error) {
	httpReq := c.newRequest(ctx, "openchoreo.TriggerBuild", http.MethodPost, c.workflowRunsURL(projectName, componentName))
	httpReq.SetJSON(map[string]any{}) // empty body; platform uses component's embedded workflow config

	result := requests.SendRequest(ctx, c.httpClient, httpReq)
	var envelope platformWorkflowRunResponse
	if err := result.ScanResponse(&envelope, http.StatusCreated); err != nil {
		return nil, fmt.Errorf("trigger build: %w", err)
	}
	return &envelope.Data, nil
}

// buildCreateComponentRequest converts the API request into the platform-api-service body.
func buildCreateComponentRequest(projectName string, req *models.CreateServiceComponentRequest) *ocCreateComponentRequest {
	params := map[string]any{
		"port":    req.Port,
		"exposed": req.Exposed,
	}

	workflow := buildWorkflowConfig(req)

	return &ocCreateComponentRequest{
		Name:        req.Name,
		DisplayName: req.DisplayName,
		Description: req.Description,
		Type:        componentTypeService,
		ProjectName: projectName,
		AutoDeploy:  true,
		Parameters:  params,
		Workflow:    workflow,
	}
}

// buildWorkflowConfig constructs the workflow section of the component request.
func buildWorkflowConfig(req *models.CreateServiceComponentRequest) *ocWorkflowConfig {
	branch := req.Repository.Branch
	if branch == "" {
		branch = defaultBranch
	}
	appPath := req.Repository.AppPath
	if appPath == "" {
		appPath = defaultAppPath
	}

	sysParams := &ocWorkflowSystemParameters{
		Repository: &ocWorkflowRepository{
			URL:     req.Repository.URL,
			AppPath: appPath,
			Revision: &ocWorkflowRevision{
				Branch: branch,
			},
		},
	}

	workflowName := workflowBuildpack
	var buildParams map[string]any

	switch req.Build.Type {
	case "docker":
		workflowName = workflowDocker
		if req.Build.Docker != nil {
			buildParams = map[string]any{
				"dockerConfigs": map[string]any{
					"dockerfilePath": req.Build.Docker.DockerfilePath,
				},
			}
		}
	default: // "buildpack" or unset defaults to buildpack
		if req.Build.Buildpack != nil {
			buildParams = map[string]any{
				"buildpackConfigs": map[string]any{
					"language":        req.Build.Buildpack.Language,
					"languageVersion": req.Build.Buildpack.LanguageVersion,
					"runCommand":      req.Build.Buildpack.RunCommand,
				},
			}
		}
	}

	return &ocWorkflowConfig{
		WorkflowName:     workflowName,
		SystemParameters: sysParams,
		Parameters:       buildParams,
	}
}

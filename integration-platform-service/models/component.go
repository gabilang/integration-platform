package models

// Component is the API response for a component resource.
type Component struct {
	UID         string `json:"uid,omitempty"`
	Name        string `json:"name"`
	ProjectName string `json:"projectName,omitempty"`
	DisplayName string `json:"displayName,omitempty"`
	Description string `json:"description,omitempty"`
	Type        string `json:"type,omitempty"`
	AutoDeploy  bool   `json:"autoDeploy,omitempty"`
	CreatedAt   string `json:"createdAt,omitempty"`
	Status      string `json:"status,omitempty"`
}

// WorkflowRun represents a triggered component build/workflow run.
type WorkflowRun struct {
	Name      string `json:"name,omitempty"`
	Status    string `json:"status,omitempty"`
	StartedAt string `json:"startedAt,omitempty"`
}

// RepositoryConfig holds source-code repository details for a component.
type RepositoryConfig struct {
	URL     string `json:"url"`
	Branch  string `json:"branch,omitempty"`
	AppPath string `json:"appPath,omitempty"`
}

// BuildpackConfig holds settings for a buildpack-based build.
type BuildpackConfig struct {
	Language        string `json:"language,omitempty"`
	LanguageVersion string `json:"languageVersion,omitempty"`
	RunCommand      string `json:"runCommand,omitempty"`
}

// DockerConfig holds settings for a Docker-based build.
type DockerConfig struct {
	DockerfilePath string `json:"dockerfilePath,omitempty"`
}

// BuildConfig describes how to build the component.
// Type must be "buildpack" or "docker".
type BuildConfig struct {
	Type      string           `json:"type"`
	Buildpack *BuildpackConfig `json:"buildpack,omitempty"`
	Docker    *DockerConfig    `json:"docker,omitempty"`
}

// CreateServiceComponentRequest is the incoming API request to create a service
// component, trigger its first build, and auto-deploy to the default environment.
type CreateServiceComponentRequest struct {
	Name        string           `json:"name"`
	DisplayName string           `json:"displayName,omitempty"`
	Description string           `json:"description,omitempty"`
	Repository  RepositoryConfig `json:"repository"`
	Build       BuildConfig      `json:"build"`
	Port        int              `json:"port,omitempty"`
	Exposed     bool             `json:"exposed,omitempty"`
}

// CreateServiceComponentResponse is returned after the component is created and
// the initial build run has been triggered.
type CreateServiceComponentResponse struct {
	Component *Component   `json:"component"`
	BuildRun  *WorkflowRun `json:"buildRun,omitempty"`
}

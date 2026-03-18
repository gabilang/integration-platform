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

// ComponentList is the paginated list response for components.
type ComponentList struct {
	Items      []Component `json:"items"`
	TotalCount int         `json:"totalCount,omitempty"`
	Page       int         `json:"page,omitempty"`
	PageSize   int         `json:"pageSize,omitempty"`
}

// WorkflowRun represents a triggered component build/workflow run.
type WorkflowRun struct {
	Name          string `json:"name,omitempty"`
	Status        string `json:"status,omitempty"`
	StartedAt     string `json:"startedAt,omitempty"`
	CompletedAt   string `json:"completedAt,omitempty"`
	ComponentName string `json:"componentName,omitempty"`
	ProjectName   string `json:"projectName,omitempty"`
	Image         string `json:"image,omitempty"`
	Commit        string `json:"commit,omitempty"`
}

// WorkflowRunList is the paginated list of workflow runs.
type WorkflowRunList struct {
	Items      []WorkflowRun `json:"items"`
	TotalCount int           `json:"totalCount,omitempty"`
}

// BuildLogEntry is a single log line from a build.
type BuildLogEntry struct {
	Timestamp string `json:"timestamp,omitempty"`
	Log       string `json:"log"`
	Level     string `json:"level,omitempty"`
}

// BuildLogs is the response for build log queries.
type BuildLogs struct {
	Logs       []BuildLogEntry `json:"logs"`
	TotalCount int             `json:"totalCount,omitempty"`
}

// WorkflowRevision is the git revision used by a component workflow.
type WorkflowRevision struct {
	Branch string `json:"branch,omitempty"`
	Commit string `json:"commit,omitempty"`
}

// WorkflowRepository is the repository config embedded in a component workflow.
type WorkflowRepository struct {
	URL      string            `json:"url,omitempty"`
	Revision *WorkflowRevision `json:"revision,omitempty"`
	AppPath  string            `json:"appPath,omitempty"`
}

// WorkflowSystemParameters holds system-level parameters for a component workflow.
type WorkflowSystemParameters struct {
	Repository *WorkflowRepository `json:"repository,omitempty"`
}

// ComponentWorkflowConfig is the workflow configuration embedded in a component.
type ComponentWorkflowConfig struct {
	Name             string                    `json:"name,omitempty"`
	SystemParameters *WorkflowSystemParameters `json:"systemParameters,omitempty"`
	Parameters       map[string]any            `json:"parameters,omitempty"`
}

// UpdateBuildParametersRequest holds the fields that can be changed after a component is created.
// Only the workflow configuration (repository, build type, parameters) is mutable.
type UpdateBuildParametersRequest struct {
	Workflow *ComponentWorkflowConfig `json:"workflow"`
}

// CreateComponentRequest matches the platform-api-service component creation format.
// The body is forwarded as-is after extracting the component name for routing.
type CreateComponentRequest struct {
	Name          string                   `json:"name"`
	DisplayName   string                   `json:"displayName,omitempty"`
	Description   string                   `json:"description,omitempty"`
	Type          string                   `json:"type,omitempty"`
	ComponentType string                   `json:"componentType,omitempty"`
	AutoDeploy    bool                     `json:"autoDeploy,omitempty"`
	Workflow      *ComponentWorkflowConfig `json:"workflow,omitempty"`
	Parameters    map[string]any           `json:"parameters,omitempty"`
}

// CreateComponentResponse is returned after the component is created and the
// initial build run has been triggered.
type CreateComponentResponse struct {
	Component *Component   `json:"component"`
	BuildRun  *WorkflowRun `json:"buildRun,omitempty"`
}

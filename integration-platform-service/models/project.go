package models

type BuildPlaneRef struct {
	Kind string `json:"kind"`
	Name string `json:"name"`
}

type ProjectCondition struct {
	Type               string `json:"type"`
	Status             string `json:"status"`
	Reason             string `json:"reason,omitempty"`
	Message            string `json:"message,omitempty"`
	LastTransitionTime string `json:"lastTransitionTime,omitempty"`
	ObservedGeneration int64  `json:"observedGeneration,omitempty"`
}

type ProjectStatus struct {
	Conditions []ProjectCondition `json:"conditions,omitempty"`
}

type Project struct {
	Name               string            `json:"name"`
	Namespace          string            `json:"namespace,omitempty"`
	UID                string            `json:"uid,omitempty"`
	DisplayName        string            `json:"displayName,omitempty"`
	Description        string            `json:"description,omitempty"`
	CreationTimestamp  string            `json:"creationTimestamp,omitempty"`
	UpdatedAt          string            `json:"updatedAt,omitempty"`
	Labels             map[string]string `json:"labels,omitempty"`
	Annotations        map[string]string `json:"annotations,omitempty"`
	DeploymentPipeline string            `json:"deploymentPipeline,omitempty"`
	BuildPlaneRef      *BuildPlaneRef    `json:"buildPlaneRef,omitempty"`
	Status             *ProjectStatus    `json:"status,omitempty"`
}

type ProjectList struct {
	Items      []Project `json:"items"`
	TotalCount int       `json:"totalCount,omitempty"`
}

type CreateProjectRequest struct {
	Name               string         `json:"name"`
	DisplayName        string         `json:"displayName,omitempty"`
	Description        string         `json:"description,omitempty"`
	DeploymentPipeline string         `json:"deploymentPipeline"`
	BuildPlaneRef      *BuildPlaneRef `json:"buildPlaneRef,omitempty"`
}

type UpdateProjectRequest struct {
	DisplayName        string         `json:"displayName,omitempty"`
	Description        string         `json:"description,omitempty"`
	DeploymentPipeline string         `json:"deploymentPipeline,omitempty"`
	BuildPlaneRef      *BuildPlaneRef `json:"buildPlaneRef,omitempty"`
}

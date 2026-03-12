/**
 * Component endpoints (namespace-scoped).
 *
 * NOTE: Components are scoped to a **namespace** (not a project) in the URL.
 * The owning project is referenced via `spec.owner.projectName` in the CR.
 * To filter by project, pass `projectName` as a query parameter.
 *
 * OpenChoreo CRD: `Component` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /namespaces/{namespaceName}/components
 *   POST   /namespaces/{namespaceName}/components
 *   GET    /namespaces/{namespaceName}/components/{componentName}
 *   PATCH  /namespaces/{namespaceName}/components/{componentName}
 *   DELETE /namespaces/{namespaceName}/components/{componentName}
 *
 *   GET    /namespaces/{namespaceName}/components/{componentName}/schema
 *   POST   /namespaces/{namespaceName}/components/{componentName}/deploy
 *   POST   /namespaces/{namespaceName}/components/{componentName}/promote
 *   POST   /namespaces/{namespaceName}/components/{componentName}/generate-release
 *
 *   GET    /namespaces/{namespaceName}/components/{componentName}/workflows
 *   GET    /namespaces/{namespaceName}/components/{componentName}/workflows/{workflowName}
 *   GET    /namespaces/{namespaceName}/components/{componentName}/workflows/{workflowName}/schema
 *
 *   GET    /namespaces/{namespaceName}/components/{componentName}/workflowruns
 *   POST   /namespaces/{namespaceName}/components/{componentName}/workflowruns
 *   GET    /namespaces/{namespaceName}/components/{componentName}/workflowruns/{workflowRunName}
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  Component,
  CreateComponentRequest,
  PatchComponentRequest,
  DeployReleaseRequest,
  PromoteComponentRequest,
  GenerateReleaseRequest,
  ComponentWorkflow,
  ComponentWorkflowRun,
  TriggerComponentWorkflowRunRequest,
  Schema,
  PaginatedList,
  ReleaseBinding,
  ComponentRelease,
} from '../../types';

interface ApiListResponse<T> {
  success: boolean;
  data: {
    items: T[];
    totalCount?: number;
    page?: number;
    pageSize?: number;
  };
}

function base(project: string): string {
  return `/projects/${project}/components`;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of all components in the namespace.
 * Optionally filter by `projectName` to get only components in a specific project.
 *
 * Maps to: GET /namespaces/{namespaceName}/components
 */
export async function listComponents(
  namespaceName: string,
  params?: PaginationParams & { projectName?: string }
): Promise<PaginatedList<Component>> {
  const response = await openchoreoClient.get<ApiListResponse<Component>>(base(namespaceName), params);
  return { items: response?.data?.items ?? [] };
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new component in the namespace.
 * The `projectName` field in the request body links the component to a project.
 *
 * Maps to: POST /namespaces/{namespaceName}/components
 */
export function createComponent(
  namespaceName: string,
  body: CreateComponentRequest
): Promise<Component> {
  return openchoreoClient.post<Component>(base(namespaceName), body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single component by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/components/{componentName}
 */
export function getComponent(
  namespaceName: string,
  componentName: string
): Promise<Component> {
  return openchoreoClient.get<Component>(
    `${base(namespaceName)}/${componentName}`
  );
}

// ---------------------------------------------------------------------------
// Patch (partial update)
// ---------------------------------------------------------------------------

/**
 * Partially updates a component's mutable fields
 * (displayName, description, autoBuild, autoDeploy, parameters, traits).
 *
 * Maps to: PATCH /namespaces/{namespaceName}/components/{componentName}
 */
export function patchComponent(
  namespaceName: string,
  componentName: string,
  body: PatchComponentRequest
): Promise<Component> {
  return openchoreoClient.patch<Component>(
    `${base(namespaceName)}/${componentName}`,
    body
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a component and all its associated resources (workload, releases, bindings).
 *
 * Maps to: DELETE /namespaces/{namespaceName}/components/{componentName}
 */
export function deleteComponent(
  namespaceName: string,
  componentName: string
): Promise<void> {
  return openchoreoClient.delete<void>(
    `${base(namespaceName)}/${componentName}`
  );
}

// ---------------------------------------------------------------------------
// Schema (merged ComponentType + Traits parameter spec)
// ---------------------------------------------------------------------------

/**
 * Returns the merged parameter schema for the component (from its ComponentType
 * and all attached Traits). Used to render the component configuration form.
 *
 * Maps to: GET /namespaces/{namespaceName}/components/{componentName}/schema
 */
export function getComponentSchema(
  namespaceName: string,
  componentName: string
): Promise<Schema> {
  return openchoreoClient.get<Schema>(
    `${base(namespaceName)}/${componentName}/schema`
  );
}

// ---------------------------------------------------------------------------
// Deploy action
// ---------------------------------------------------------------------------

/**
 * Triggers an immediate deployment of the component to the given environment.
 * Creates or updates a ReleaseBinding with `state: Active`.
 *
 * Maps to: POST /namespaces/{namespaceName}/components/{componentName}/deploy
 */
export function deployComponent(
  namespaceName: string,
  componentName: string,
  body: DeployReleaseRequest
): Promise<ReleaseBinding> {
  return openchoreoClient.post<ReleaseBinding>(
    `${base(namespaceName)}/${componentName}/deploy`,
    body
  );
}

// ---------------------------------------------------------------------------
// Promote action
// ---------------------------------------------------------------------------

/**
 * Promotes the component's current release from one environment to another
 * as defined in the project's DeploymentPipeline.
 *
 * Maps to: POST /namespaces/{namespaceName}/components/{componentName}/promote
 */
export function promoteComponent(
  namespaceName: string,
  componentName: string,
  body: PromoteComponentRequest
): Promise<ReleaseBinding> {
  return openchoreoClient.post<ReleaseBinding>(
    `${base(namespaceName)}/${componentName}/promote`,
    body
  );
}

// ---------------------------------------------------------------------------
// Generate Release action
// ---------------------------------------------------------------------------

/**
 * Generates an immutable release snapshot from the current component state
 * (ComponentType, Traits, Workload).
 *
 * Maps to: POST /namespaces/{namespaceName}/components/{componentName}/generate-release
 */
export function generateRelease(
  namespaceName: string,
  componentName: string,
  body?: GenerateReleaseRequest
): Promise<ComponentRelease> {
  return openchoreoClient.post<ComponentRelease>(
    `${base(namespaceName)}/${componentName}/generate-release`,
    body
  );
}

// ---------------------------------------------------------------------------
// Component Workflows (build CI templates)
// ---------------------------------------------------------------------------

/**
 * Returns the list of build/CI workflow templates available for this component.
 * Each workflow can be triggered as a ComponentWorkflowRun.
 *
 * Maps to: GET /namespaces/{namespaceName}/components/{componentName}/workflows
 */
export function listComponentWorkflows(
  namespaceName: string,
  componentName: string,
  pagination?: PaginationParams
): Promise<PaginatedList<ComponentWorkflow>> {
  return openchoreoClient.get<PaginatedList<ComponentWorkflow>>(
    `${base(namespaceName)}/${componentName}/workflows`,
    pagination
  );
}

/**
 * Returns a single workflow template by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/components/{componentName}/workflows/{workflowName}
 */
export function getComponentWorkflow(
  namespaceName: string,
  componentName: string,
  workflowName: string
): Promise<ComponentWorkflow> {
  return openchoreoClient.get<ComponentWorkflow>(
    `${base(namespaceName)}/${componentName}/workflows/${workflowName}`
  );
}

/**
 * Returns the parameter schema for a specific component workflow.
 * Used to render a dynamic trigger form.
 *
 * Maps to: GET /namespaces/{namespaceName}/components/{componentName}/workflows/{workflowName}/schema
 */
export function getComponentWorkflowSchema(
  namespaceName: string,
  componentName: string,
  workflowName: string
): Promise<Schema> {
  return openchoreoClient.get<Schema>(
    `${base(namespaceName)}/${componentName}/workflows/${workflowName}/schema`
  );
}

// ---------------------------------------------------------------------------
// Component Workflow Runs (build / CI runs)
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of all workflow runs (builds) for the component.
 *
 * Maps to: GET /namespaces/{namespaceName}/components/{componentName}/workflowruns
 */
export function listComponentWorkflowRuns(
  namespaceName: string,
  componentName: string,
  params?: PaginationParams & { workflowName?: string }
): Promise<PaginatedList<ComponentWorkflowRun>> {
  return openchoreoClient.get<PaginatedList<ComponentWorkflowRun>>(
    `${base(namespaceName)}/${componentName}/workflowruns`,
    params
  );
}

/**
 * Triggers a new workflow run (build) for the component.
 * Optionally pass custom parameters to override workflow defaults.
 *
 * Maps to: POST /namespaces/{namespaceName}/components/{componentName}/workflowruns
 */
export function triggerComponentWorkflowRun(
  namespaceName: string,
  componentName: string,
  body: TriggerComponentWorkflowRunRequest
): Promise<ComponentWorkflowRun> {
  return openchoreoClient.post<ComponentWorkflowRun>(
    `${base(namespaceName)}/${componentName}/workflowruns`,
    body
  );
}

/**
 * Returns a single workflow run by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/components/{componentName}/workflowruns/{workflowRunName}
 */
export function getComponentWorkflowRun(
  namespaceName: string,
  componentName: string,
  workflowRunName: string
): Promise<ComponentWorkflowRun> {
  return openchoreoClient.get<ComponentWorkflowRun>(
    `${base(namespaceName)}/${componentName}/workflowruns/${workflowRunName}`
  );
}

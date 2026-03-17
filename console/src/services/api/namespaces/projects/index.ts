/**
 * Project endpoints (namespace-scoped).
 *
 * A Project groups related Components under a shared deployment pipeline.
 * Projects are namespace-scoped resources in OpenChoreo.
 *
 * OpenChoreo CRD: `Project` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /namespaces/{namespaceName}/projects
 *   POST   /namespaces/{namespaceName}/projects
 *   GET    /namespaces/{namespaceName}/projects/{projectName}
 *   PUT    /namespaces/{namespaceName}/projects/{projectName}
 *   DELETE /namespaces/{namespaceName}/projects/{projectName}
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  PaginatedList,
} from '../../types';

interface ApiListResponse<T> {
  items: T[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
}

function base(_ns: string): string {
  return `/projects`;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of all projects in the given namespace.
 *
 * Maps to: GET /namespaces/{namespaceName}/projects
 */
export async function listProjects(
  namespaceName: string,
  pagination?: PaginationParams,
): Promise<PaginatedList<Project>> {
  const response = await openchoreoClient.get<ApiListResponse<Project>>(base(namespaceName), pagination);
  return { items: response?.items ?? [] };
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new project within the given namespace.
 * The `deploymentPipeline` field references an existing DeploymentPipeline CR.
 *
 * Maps to: POST /namespaces/{namespaceName}/projects
 */
export function createProject(
  namespaceName: string,
  body: CreateProjectRequest,
): Promise<Project> {
  return openchoreoClient.post<Project>(base(namespaceName), body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single project by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/projects/{projectName}
 */
export function getProject(namespaceName: string, projectName: string): Promise<Project> {
  return openchoreoClient.get<Project>(`${base(namespaceName)}/${projectName}`);
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of a project (displayName, description,
 * deploymentPipeline, buildPlaneRef).
 *
 * Maps to: PUT /namespaces/{namespaceName}/projects/{projectName}
 */
export function updateProject(
  namespaceName: string,
  projectName: string,
  body: UpdateProjectRequest,
): Promise<Project> {
  return openchoreoClient.put<Project>(`${base(namespaceName)}/${projectName}`, body);
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a project and all components within it.
 *
 * Maps to: DELETE /namespaces/{namespaceName}/projects/{projectName}
 */
export function deleteProject(namespaceName: string, projectName: string): Promise<void> {
  return openchoreoClient.delete<void>(`${base(namespaceName)}/${projectName}`);
}

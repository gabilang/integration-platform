/**
 * Deployment Pipeline endpoints (namespace-scoped).
 *
 * A DeploymentPipeline defines the ordered promotion path for components
 * through environments (e.g. dev → staging → prod).
 *
 * OpenChoreo CRD: `DeploymentPipeline` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /namespaces/{namespaceName}/deploymentpipelines
 *   POST   /namespaces/{namespaceName}/deploymentpipelines
 *   GET    /namespaces/{namespaceName}/deploymentpipelines/{deploymentPipelineName}
 *   PUT    /namespaces/{namespaceName}/deploymentpipelines/{deploymentPipelineName}
 *   DELETE /namespaces/{namespaceName}/deploymentpipelines/{deploymentPipelineName}
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  DeploymentPipeline,
  CreateDeploymentPipelineRequest,
  UpdateDeploymentPipelineRequest,
  PaginatedList,
} from '../../types';

function base(ns: string): string {
  return `/namespaces/${ns}/deploymentpipelines`;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of deployment pipelines in the namespace.
 *
 * Maps to: GET /namespaces/{namespaceName}/deploymentpipelines
 */
export function listDeploymentPipelines(
  namespaceName: string,
  pagination?: PaginationParams
): Promise<PaginatedList<DeploymentPipeline>> {
  return openchoreoClient.get<PaginatedList<DeploymentPipeline>>(
    base(namespaceName),
    pagination
  );
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new deployment pipeline in the namespace.
 *
 * Maps to: POST /namespaces/{namespaceName}/deploymentpipelines
 */
export function createDeploymentPipeline(
  namespaceName: string,
  body: CreateDeploymentPipelineRequest
): Promise<DeploymentPipeline> {
  return openchoreoClient.post<DeploymentPipeline>(base(namespaceName), body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single deployment pipeline by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/deploymentpipelines/{deploymentPipelineName}
 */
export function getDeploymentPipeline(
  namespaceName: string,
  deploymentPipelineName: string
): Promise<DeploymentPipeline> {
  return openchoreoClient.get<DeploymentPipeline>(
    `${base(namespaceName)}/${deploymentPipelineName}`
  );
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of a deployment pipeline.
 *
 * Maps to: PUT /namespaces/{namespaceName}/deploymentpipelines/{deploymentPipelineName}
 */
export function updateDeploymentPipeline(
  namespaceName: string,
  deploymentPipelineName: string,
  body: UpdateDeploymentPipelineRequest
): Promise<DeploymentPipeline> {
  return openchoreoClient.put<DeploymentPipeline>(
    `${base(namespaceName)}/${deploymentPipelineName}`,
    body
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a deployment pipeline by name.
 *
 * Maps to: DELETE /namespaces/{namespaceName}/deploymentpipelines/{deploymentPipelineName}
 */
export function deleteDeploymentPipeline(
  namespaceName: string,
  deploymentPipelineName: string
): Promise<void> {
  return openchoreoClient.delete<void>(
    `${base(namespaceName)}/${deploymentPipelineName}`
  );
}

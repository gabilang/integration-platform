/**
 * Workflow endpoints (namespace-scoped).
 *
 * Workflows are reusable automation templates that can be triggered
 * as WorkflowRuns (e.g. build, test, deploy pipelines).
 *
 * OpenChoreo CRD: `Workflow` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /namespaces/{namespaceName}/workflows
 *   POST   /namespaces/{namespaceName}/workflows
 *   GET    /namespaces/{namespaceName}/workflows/{workflowName}
 *   PUT    /namespaces/{namespaceName}/workflows/{workflowName}
 *   DELETE /namespaces/{namespaceName}/workflows/{workflowName}
 *   GET    /namespaces/{namespaceName}/workflows/{workflowName}/schema
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type { Workflow, Schema, PaginatedList } from '../../types';

function base(ns: string): string {
  return `/namespaces/${ns}/workflows`;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of workflows in the namespace.
 *
 * Maps to: GET /namespaces/{namespaceName}/workflows
 */
export function listWorkflows(
  namespaceName: string,
  pagination?: PaginationParams
): Promise<PaginatedList<Workflow>> {
  return openchoreoClient.get<PaginatedList<Workflow>>(
    base(namespaceName),
    pagination
  );
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new workflow in the namespace.
 *
 * Maps to: POST /namespaces/{namespaceName}/workflows
 */
export function createWorkflow(
  namespaceName: string,
  body: {
    name: string;
    displayName?: string;
    description?: string;
    schema?: Schema;
  }
): Promise<Workflow> {
  return openchoreoClient.post<Workflow>(base(namespaceName), body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single workflow by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/workflows/{workflowName}
 */
export function getWorkflow(
  namespaceName: string,
  workflowName: string
): Promise<Workflow> {
  return openchoreoClient.get<Workflow>(
    `${base(namespaceName)}/${workflowName}`
  );
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of a workflow.
 *
 * Maps to: PUT /namespaces/{namespaceName}/workflows/{workflowName}
 */
export function updateWorkflow(
  namespaceName: string,
  workflowName: string,
  body: { displayName?: string; description?: string; schema?: Schema }
): Promise<Workflow> {
  return openchoreoClient.put<Workflow>(
    `${base(namespaceName)}/${workflowName}`,
    body
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a workflow by name.
 *
 * Maps to: DELETE /namespaces/{namespaceName}/workflows/{workflowName}
 */
export function deleteWorkflow(
  namespaceName: string,
  workflowName: string
): Promise<void> {
  return openchoreoClient.delete<void>(
    `${base(namespaceName)}/${workflowName}`
  );
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * Returns the parameter schema for this workflow.
 *
 * Maps to: GET /namespaces/{namespaceName}/workflows/{workflowName}/schema
 */
export function getWorkflowSchema(
  namespaceName: string,
  workflowName: string
): Promise<Schema> {
  return openchoreoClient.get<Schema>(
    `${base(namespaceName)}/${workflowName}/schema`
  );
}

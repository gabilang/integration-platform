/**
 * WorkflowRun endpoints (namespace-scoped).
 *
 * WorkflowRuns represent a single execution of a Workflow. They expose
 * sub-resources for status details, logs, and events.
 *
 * OpenChoreo CRD: `WorkflowRun` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /namespaces/{namespaceName}/workflowruns
 *   POST   /namespaces/{namespaceName}/workflowruns
 *   GET    /namespaces/{namespaceName}/workflowruns/{runName}
 *   GET    /namespaces/{namespaceName}/workflowruns/{runName}/status
 *   GET    /namespaces/{namespaceName}/workflowruns/{runName}/logs
 *   GET    /namespaces/{namespaceName}/workflowruns/{runName}/events
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  WorkflowRun,
  CreateWorkflowRunRequest,
  WorkflowRunStatusDetails,
  WorkflowRunLog,
  WorkflowRunEvent,
  PaginatedList,
} from '../../types';

function base(ns: string): string {
  return `/namespaces/${ns}/workflowruns`;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of workflow runs in the namespace.
 *
 * Maps to: GET /namespaces/{namespaceName}/workflowruns
 */
export function listWorkflowRuns(
  namespaceName: string,
  pagination?: PaginationParams & { workflowName?: string }
): Promise<PaginatedList<WorkflowRun>> {
  return openchoreoClient.get<PaginatedList<WorkflowRun>>(
    base(namespaceName),
    pagination
  );
}

// ---------------------------------------------------------------------------
// Create (trigger)
// ---------------------------------------------------------------------------

/**
 * Triggers a new workflow run.
 *
 * Maps to: POST /namespaces/{namespaceName}/workflowruns
 */
export function createWorkflowRun(
  namespaceName: string,
  body: CreateWorkflowRunRequest
): Promise<WorkflowRun> {
  return openchoreoClient.post<WorkflowRun>(base(namespaceName), body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single workflow run by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/workflowruns/{runName}
 */
export function getWorkflowRun(
  namespaceName: string,
  runName: string
): Promise<WorkflowRun> {
  return openchoreoClient.get<WorkflowRun>(`${base(namespaceName)}/${runName}`);
}

// ---------------------------------------------------------------------------
// Status sub-resource
// ---------------------------------------------------------------------------

/**
 * Returns the detailed status of a workflow run (step statuses, phases).
 *
 * Maps to: GET /namespaces/{namespaceName}/workflowruns/{runName}/status
 */
export function getWorkflowRunStatus(
  namespaceName: string,
  runName: string
): Promise<WorkflowRunStatusDetails> {
  return openchoreoClient.get<WorkflowRunStatusDetails>(
    `${base(namespaceName)}/${runName}/status`
  );
}

// ---------------------------------------------------------------------------
// Logs sub-resource
// ---------------------------------------------------------------------------

/**
 * Returns the logs for a workflow run.
 *
 * Maps to: GET /namespaces/{namespaceName}/workflowruns/{runName}/logs
 */
export function getWorkflowRunLogs(
  namespaceName: string,
  runName: string,
  params?: { nodeId?: string }
): Promise<WorkflowRunLog[]> {
  return openchoreoClient.get<WorkflowRunLog[]>(
    `${base(namespaceName)}/${runName}/logs`,
    params
  );
}

// ---------------------------------------------------------------------------
// Events sub-resource
// ---------------------------------------------------------------------------

/**
 * Returns the Kubernetes events associated with a workflow run.
 *
 * Maps to: GET /namespaces/{namespaceName}/workflowruns/{runName}/events
 */
export function getWorkflowRunEvents(
  namespaceName: string,
  runName: string
): Promise<WorkflowRunEvent[]> {
  return openchoreoClient.get<WorkflowRunEvent[]>(
    `${base(namespaceName)}/${runName}/events`
  );
}

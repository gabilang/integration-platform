/**
 * Workload endpoints (namespace-scoped, component sub-resource).
 *
 * Workloads declare the runtime specification for a component in a
 * specific environment (containers, endpoints, connections).
 *
 * OpenChoreo CRD: `Workload` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /namespaces/{namespaceName}/components/{componentName}/workloads
 *   POST   /namespaces/{namespaceName}/components/{componentName}/workloads
 *   GET    /namespaces/{namespaceName}/components/{componentName}/workloads/{workloadName}
 *   PUT    /namespaces/{namespaceName}/components/{componentName}/workloads/{workloadName}
 *   DELETE /namespaces/{namespaceName}/components/{componentName}/workloads/{workloadName}
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  Workload,
  UpsertWorkloadRequest,
  PaginatedList,
} from '../../types';

function base(ns: string, componentName: string): string {
  return `/namespaces/${ns}/components/${componentName}/workloads`;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of workloads for a component.
 *
 * Maps to: GET /namespaces/{namespaceName}/components/{componentName}/workloads
 */
export function listWorkloads(
  namespaceName: string,
  componentName: string,
  pagination?: PaginationParams
): Promise<PaginatedList<Workload>> {
  return openchoreoClient.get<PaginatedList<Workload>>(
    base(namespaceName, componentName),
    pagination
  );
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new workload for a component.
 *
 * Maps to: POST /namespaces/{namespaceName}/components/{componentName}/workloads
 */
export function createWorkload(
  namespaceName: string,
  componentName: string,
  body: UpsertWorkloadRequest & { name: string }
): Promise<Workload> {
  return openchoreoClient.post<Workload>(
    base(namespaceName, componentName),
    body
  );
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single workload by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/components/{componentName}/workloads/{workloadName}
 */
export function getWorkload(
  namespaceName: string,
  componentName: string,
  workloadName: string
): Promise<Workload> {
  return openchoreoClient.get<Workload>(
    `${base(namespaceName, componentName)}/${workloadName}`
  );
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of a workload.
 *
 * Maps to: PUT /namespaces/{namespaceName}/components/{componentName}/workloads/{workloadName}
 */
export function updateWorkload(
  namespaceName: string,
  componentName: string,
  workloadName: string,
  body: UpsertWorkloadRequest
): Promise<Workload> {
  return openchoreoClient.put<Workload>(
    `${base(namespaceName, componentName)}/${workloadName}`,
    body
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a workload by name.
 *
 * Maps to: DELETE /namespaces/{namespaceName}/components/{componentName}/workloads/{workloadName}
 */
export function deleteWorkload(
  namespaceName: string,
  componentName: string,
  workloadName: string
): Promise<void> {
  return openchoreoClient.delete<void>(
    `${base(namespaceName, componentName)}/${workloadName}`
  );
}

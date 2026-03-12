/**
 * DataPlane endpoints (namespace-scoped).
 *
 * DataPlanes represent cluster targets where component workloads are deployed.
 *
 * OpenChoreo CRD: `DataPlane` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /namespaces/{namespaceName}/dataplanes
 *   POST   /namespaces/{namespaceName}/dataplanes
 *   GET    /namespaces/{namespaceName}/dataplanes/{dpName}
 *   PUT    /namespaces/{namespaceName}/dataplanes/{dpName}
 *   DELETE /namespaces/{namespaceName}/dataplanes/{dpName}
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  DataPlane,
  CreateDataPlaneRequest,
  UpdateDataPlaneRequest,
  PaginatedList,
} from '../../types';

function base(ns: string): string {
  return `/namespaces/${ns}/dataplanes`;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of data planes in the namespace.
 *
 * Maps to: GET /namespaces/{namespaceName}/dataplanes
 */
export function listDataPlanes(
  namespaceName: string,
  pagination?: PaginationParams
): Promise<PaginatedList<DataPlane>> {
  return openchoreoClient.get<PaginatedList<DataPlane>>(
    base(namespaceName),
    pagination
  );
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new data plane in the namespace.
 *
 * Maps to: POST /namespaces/{namespaceName}/dataplanes
 */
export function createDataPlane(
  namespaceName: string,
  body: CreateDataPlaneRequest
): Promise<DataPlane> {
  return openchoreoClient.post<DataPlane>(base(namespaceName), body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single data plane by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/dataplanes/{dpName}
 */
export function getDataPlane(
  namespaceName: string,
  dpName: string
): Promise<DataPlane> {
  return openchoreoClient.get<DataPlane>(`${base(namespaceName)}/${dpName}`);
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of a data plane.
 *
 * Maps to: PUT /namespaces/{namespaceName}/dataplanes/{dpName}
 */
export function updateDataPlane(
  namespaceName: string,
  dpName: string,
  body: UpdateDataPlaneRequest
): Promise<DataPlane> {
  return openchoreoClient.put<DataPlane>(
    `${base(namespaceName)}/${dpName}`,
    body
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a data plane by name.
 *
 * Maps to: DELETE /namespaces/{namespaceName}/dataplanes/{dpName}
 */
export function deleteDataPlane(
  namespaceName: string,
  dpName: string
): Promise<void> {
  return openchoreoClient.delete<void>(`${base(namespaceName)}/${dpName}`);
}

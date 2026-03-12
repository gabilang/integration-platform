/**
 * ClusterDataPlane endpoints (cluster-scoped).
 *
 * ClusterDataPlanes are shared across namespaces and represent
 * physical cluster targets for deploying workloads.
 *
 * OpenChoreo CRD: `ClusterDataPlane` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /clusterdataplanes
 *   POST   /clusterdataplanes
 *   GET    /clusterdataplanes/{dpName}
 *   PUT    /clusterdataplanes/{dpName}
 *   DELETE /clusterdataplanes/{dpName}
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  ClusterDataPlane,
  CreateClusterDataPlaneRequest,
  UpdateClusterDataPlaneRequest,
  PaginatedList,
} from '../../types';

const BASE = '/clusterdataplanes';

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of cluster data planes.
 *
 * Maps to: GET /clusterdataplanes
 */
export function listClusterDataPlanes(
  pagination?: PaginationParams
): Promise<PaginatedList<ClusterDataPlane>> {
  return openchoreoClient.get<PaginatedList<ClusterDataPlane>>(
    BASE,
    pagination
  );
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new cluster data plane.
 *
 * Maps to: POST /clusterdataplanes
 */
export function createClusterDataPlane(
  body: CreateClusterDataPlaneRequest
): Promise<ClusterDataPlane> {
  return openchoreoClient.post<ClusterDataPlane>(BASE, body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single cluster data plane by name.
 *
 * Maps to: GET /clusterdataplanes/{dpName}
 */
export function getClusterDataPlane(dpName: string): Promise<ClusterDataPlane> {
  return openchoreoClient.get<ClusterDataPlane>(`${BASE}/${dpName}`);
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of a cluster data plane.
 *
 * Maps to: PUT /clusterdataplanes/{dpName}
 */
export function updateClusterDataPlane(
  dpName: string,
  body: UpdateClusterDataPlaneRequest
): Promise<ClusterDataPlane> {
  return openchoreoClient.put<ClusterDataPlane>(`${BASE}/${dpName}`, body);
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a cluster data plane by name.
 *
 * Maps to: DELETE /clusterdataplanes/{dpName}
 */
export function deleteClusterDataPlane(dpName: string): Promise<void> {
  return openchoreoClient.delete<void>(`${BASE}/${dpName}`);
}

/**
 * ClusterBuildPlane endpoints (cluster-scoped).
 *
 * ClusterBuildPlanes provide shared CI build capacity across namespaces.
 *
 * OpenChoreo CRD: `ClusterBuildPlane` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /clusterbuildplanes
 *   POST   /clusterbuildplanes
 *   GET    /clusterbuildplanes/{bpName}
 *   PUT    /clusterbuildplanes/{bpName}
 *   DELETE /clusterbuildplanes/{bpName}
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  ClusterBuildPlane,
  CreateBuildPlaneRequest,
  PaginatedList,
} from '../../types';

const BASE = '/clusterbuildplanes';

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of cluster build planes.
 *
 * Maps to: GET /clusterbuildplanes
 */
export function listClusterBuildPlanes(
  pagination?: PaginationParams
): Promise<PaginatedList<ClusterBuildPlane>> {
  return openchoreoClient.get<PaginatedList<ClusterBuildPlane>>(
    BASE,
    pagination
  );
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new cluster build plane.
 *
 * Maps to: POST /clusterbuildplanes
 */
export function createClusterBuildPlane(
  body: CreateBuildPlaneRequest
): Promise<ClusterBuildPlane> {
  return openchoreoClient.post<ClusterBuildPlane>(BASE, body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single cluster build plane by name.
 *
 * Maps to: GET /clusterbuildplanes/{bpName}
 */
export function getClusterBuildPlane(
  bpName: string
): Promise<ClusterBuildPlane> {
  return openchoreoClient.get<ClusterBuildPlane>(`${BASE}/${bpName}`);
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of a cluster build plane.
 *
 * Maps to: PUT /clusterbuildplanes/{bpName}
 */
export function updateClusterBuildPlane(
  bpName: string,
  body: CreateBuildPlaneRequest
): Promise<ClusterBuildPlane> {
  return openchoreoClient.put<ClusterBuildPlane>(`${BASE}/${bpName}`, body);
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a cluster build plane by name.
 *
 * Maps to: DELETE /clusterbuildplanes/{bpName}
 */
export function deleteClusterBuildPlane(bpName: string): Promise<void> {
  return openchoreoClient.delete<void>(`${BASE}/${bpName}`);
}

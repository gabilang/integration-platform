/**
 * ClusterObservabilityPlane endpoints (cluster-scoped).
 *
 * ClusterObservabilityPlanes provide shared observability backends across namespaces.
 *
 * OpenChoreo CRD: `ClusterObservabilityPlane` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /clusterobservabilityplanes
 *   POST   /clusterobservabilityplanes
 *   GET    /clusterobservabilityplanes/{opName}
 *   PUT    /clusterobservabilityplanes/{opName}
 *   DELETE /clusterobservabilityplanes/{opName}
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  ClusterObservabilityPlane,
  CreateObservabilityPlaneRequest,
  PaginatedList,
} from '../../types';

const BASE = '/clusterobservabilityplanes';

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of cluster observability planes.
 *
 * Maps to: GET /clusterobservabilityplanes
 */
export function listClusterObservabilityPlanes(
  pagination?: PaginationParams
): Promise<PaginatedList<ClusterObservabilityPlane>> {
  return openchoreoClient.get<PaginatedList<ClusterObservabilityPlane>>(
    BASE,
    pagination
  );
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new cluster observability plane.
 *
 * Maps to: POST /clusterobservabilityplanes
 */
export function createClusterObservabilityPlane(
  body: CreateObservabilityPlaneRequest
): Promise<ClusterObservabilityPlane> {
  return openchoreoClient.post<ClusterObservabilityPlane>(BASE, body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single cluster observability plane by name.
 *
 * Maps to: GET /clusterobservabilityplanes/{opName}
 */
export function getClusterObservabilityPlane(
  opName: string
): Promise<ClusterObservabilityPlane> {
  return openchoreoClient.get<ClusterObservabilityPlane>(`${BASE}/${opName}`);
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of a cluster observability plane.
 *
 * Maps to: PUT /clusterobservabilityplanes/{opName}
 */
export function updateClusterObservabilityPlane(
  opName: string,
  body: CreateObservabilityPlaneRequest
): Promise<ClusterObservabilityPlane> {
  return openchoreoClient.put<ClusterObservabilityPlane>(
    `${BASE}/${opName}`,
    body
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a cluster observability plane by name.
 *
 * Maps to: DELETE /clusterobservabilityplanes/{opName}
 */
export function deleteClusterObservabilityPlane(opName: string): Promise<void> {
  return openchoreoClient.delete<void>(`${BASE}/${opName}`);
}

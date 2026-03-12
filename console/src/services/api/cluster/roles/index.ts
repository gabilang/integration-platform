/**
 * ClusterRole endpoints (cluster-scoped RBAC).
 *
 * ClusterRoles define allowed actions at the cluster level (across all namespaces).
 *
 * OpenChoreo CRD: `ClusterRole` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /clusterroles
 *   POST   /clusterroles
 *   GET    /clusterroles/{roleName}
 *   PUT    /clusterroles/{roleName}
 *   DELETE /clusterroles/{roleName}
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  ClusterRole,
  CreateClusterRoleRequest,
  UpdateClusterRoleRequest,
  PaginatedList,
} from '../../types';

const BASE = '/clusterroles';

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of cluster roles.
 *
 * Maps to: GET /clusterroles
 */
export function listClusterRoles(
  pagination?: PaginationParams
): Promise<PaginatedList<ClusterRole>> {
  return openchoreoClient.get<PaginatedList<ClusterRole>>(BASE, pagination);
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new cluster role.
 *
 * Maps to: POST /clusterroles
 */
export function createClusterRole(
  body: CreateClusterRoleRequest
): Promise<ClusterRole> {
  return openchoreoClient.post<ClusterRole>(BASE, body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single cluster role by name.
 *
 * Maps to: GET /clusterroles/{roleName}
 */
export function getClusterRole(roleName: string): Promise<ClusterRole> {
  return openchoreoClient.get<ClusterRole>(`${BASE}/${roleName}`);
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of a cluster role.
 *
 * Maps to: PUT /clusterroles/{roleName}
 */
export function updateClusterRole(
  roleName: string,
  body: UpdateClusterRoleRequest
): Promise<ClusterRole> {
  return openchoreoClient.put<ClusterRole>(`${BASE}/${roleName}`, body);
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a cluster role by name.
 *
 * Maps to: DELETE /clusterroles/{roleName}
 */
export function deleteClusterRole(roleName: string): Promise<void> {
  return openchoreoClient.delete<void>(`${BASE}/${roleName}`);
}

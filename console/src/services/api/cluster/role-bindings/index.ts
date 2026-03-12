/**
 * ClusterRoleBinding endpoints (cluster-scoped RBAC).
 *
 * Binds a JWT entitlement claim to a ClusterRole.
 *
 * OpenChoreo CRD: `ClusterRoleBinding` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /clusterrolebindings
 *   POST   /clusterrolebindings
 *   GET    /clusterrolebindings/{crbName}
 *   PUT    /clusterrolebindings/{crbName}
 *   DELETE /clusterrolebindings/{crbName}
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  ClusterRoleBinding,
  CreateClusterRoleBindingRequest,
  UpdateClusterRoleBindingRequest,
  PaginatedList,
} from '../../types';

const BASE = '/clusterrolebindings';

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of cluster role bindings.
 *
 * Maps to: GET /clusterrolebindings
 */
export function listClusterRoleBindings(
  pagination?: PaginationParams
): Promise<PaginatedList<ClusterRoleBinding>> {
  return openchoreoClient.get<PaginatedList<ClusterRoleBinding>>(
    BASE,
    pagination
  );
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new cluster role binding.
 *
 * Maps to: POST /clusterrolebindings
 */
export function createClusterRoleBinding(
  body: CreateClusterRoleBindingRequest
): Promise<ClusterRoleBinding> {
  return openchoreoClient.post<ClusterRoleBinding>(BASE, body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single cluster role binding by name.
 *
 * Maps to: GET /clusterrolebindings/{crbName}
 */
export function getClusterRoleBinding(
  crbName: string
): Promise<ClusterRoleBinding> {
  return openchoreoClient.get<ClusterRoleBinding>(`${BASE}/${crbName}`);
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of a cluster role binding.
 *
 * Maps to: PUT /clusterrolebindings/{crbName}
 */
export function updateClusterRoleBinding(
  crbName: string,
  body: UpdateClusterRoleBindingRequest
): Promise<ClusterRoleBinding> {
  return openchoreoClient.put<ClusterRoleBinding>(`${BASE}/${crbName}`, body);
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a cluster role binding by name.
 *
 * Maps to: DELETE /clusterrolebindings/{crbName}
 */
export function deleteClusterRoleBinding(crbName: string): Promise<void> {
  return openchoreoClient.delete<void>(`${BASE}/${crbName}`);
}

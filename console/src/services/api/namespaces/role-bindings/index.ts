/**
 * RoleBinding endpoints (namespace-scoped RBAC).
 *
 * Binds a JWT entitlement claim to a Role, optionally scoped to a project/component.
 *
 * OpenChoreo CRD: `RoleBinding` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /namespaces/{namespaceName}/rolebindings
 *   POST   /namespaces/{namespaceName}/rolebindings
 *   GET    /namespaces/{namespaceName}/rolebindings/{rbName}
 *   PUT    /namespaces/{namespaceName}/rolebindings/{rbName}
 *   DELETE /namespaces/{namespaceName}/rolebindings/{rbName}
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  RoleBinding,
  CreateRoleBindingRequest,
  UpdateRoleBindingRequest,
  PaginatedList,
} from '../../types';

function base(ns: string): string {
  return `/namespaces/${ns}/rolebindings`;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of role bindings in the namespace.
 *
 * Maps to: GET /namespaces/{namespaceName}/rolebindings
 */
export function listRoleBindings(
  namespaceName: string,
  pagination?: PaginationParams
): Promise<PaginatedList<RoleBinding>> {
  return openchoreoClient.get<PaginatedList<RoleBinding>>(
    base(namespaceName),
    pagination
  );
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new role binding in the namespace.
 *
 * Maps to: POST /namespaces/{namespaceName}/rolebindings
 */
export function createRoleBinding(
  namespaceName: string,
  body: CreateRoleBindingRequest
): Promise<RoleBinding> {
  return openchoreoClient.post<RoleBinding>(base(namespaceName), body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single role binding by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/rolebindings/{rbName}
 */
export function getRoleBinding(
  namespaceName: string,
  rbName: string
): Promise<RoleBinding> {
  return openchoreoClient.get<RoleBinding>(`${base(namespaceName)}/${rbName}`);
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of a role binding.
 *
 * Maps to: PUT /namespaces/{namespaceName}/rolebindings/{rbName}
 */
export function updateRoleBinding(
  namespaceName: string,
  rbName: string,
  body: UpdateRoleBindingRequest
): Promise<RoleBinding> {
  return openchoreoClient.put<RoleBinding>(
    `${base(namespaceName)}/${rbName}`,
    body
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a role binding by name.
 *
 * Maps to: DELETE /namespaces/{namespaceName}/rolebindings/{rbName}
 */
export function deleteRoleBinding(
  namespaceName: string,
  rbName: string
): Promise<void> {
  return openchoreoClient.delete<void>(`${base(namespaceName)}/${rbName}`);
}

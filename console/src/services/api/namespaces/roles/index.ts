/**
 * Role endpoints (namespace-scoped RBAC).
 *
 * Namespace-scoped roles define allowed actions within a namespace.
 *
 * OpenChoreo CRD: `Role` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /namespaces/{namespaceName}/roles
 *   POST   /namespaces/{namespaceName}/roles
 *   GET    /namespaces/{namespaceName}/roles/{roleName}
 *   PUT    /namespaces/{namespaceName}/roles/{roleName}
 *   DELETE /namespaces/{namespaceName}/roles/{roleName}
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  PaginatedList,
} from '../../types';

function base(ns: string): string {
  return `/namespaces/${ns}/roles`;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of roles in the namespace.
 *
 * Maps to: GET /namespaces/{namespaceName}/roles
 */
export function listRoles(
  namespaceName: string,
  pagination?: PaginationParams
): Promise<PaginatedList<Role>> {
  return openchoreoClient.get<PaginatedList<Role>>(
    base(namespaceName),
    pagination
  );
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new role in the namespace.
 *
 * Maps to: POST /namespaces/{namespaceName}/roles
 */
export function createRole(
  namespaceName: string,
  body: CreateRoleRequest
): Promise<Role> {
  return openchoreoClient.post<Role>(base(namespaceName), body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single role by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/roles/{roleName}
 */
export function getRole(
  namespaceName: string,
  roleName: string
): Promise<Role> {
  return openchoreoClient.get<Role>(`${base(namespaceName)}/${roleName}`);
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of a role.
 *
 * Maps to: PUT /namespaces/{namespaceName}/roles/{roleName}
 */
export function updateRole(
  namespaceName: string,
  roleName: string,
  body: UpdateRoleRequest
): Promise<Role> {
  return openchoreoClient.put<Role>(`${base(namespaceName)}/${roleName}`, body);
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a role by name.
 *
 * Maps to: DELETE /namespaces/{namespaceName}/roles/{roleName}
 */
export function deleteRole(
  namespaceName: string,
  roleName: string
): Promise<void> {
  return openchoreoClient.delete<void>(`${base(namespaceName)}/${roleName}`);
}

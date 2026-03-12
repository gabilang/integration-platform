/**
 * Namespace (= Organization) endpoints.
 *
 * In OpenChoreo a Namespace is the top-level tenant / organization unit.
 * It is a cluster-scoped Kubernetes resource that maps directly to a
 * Kubernetes namespace.
 *
 * OpenChoreo CRD: `Namespace` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /namespaces
 *   POST   /namespaces
 *   GET    /namespaces/{namespaceName}
 *   PUT    /namespaces/{namespaceName}
 *   DELETE /namespaces/{namespaceName}
 */

import { openchoreoClient } from '../client';
import type { PaginationParams } from '../client';
import type {
  Namespace,
  CreateNamespaceRequest,
  UpdateNamespaceRequest,
  PaginatedList,
} from '../types';

const BASE = '/namespaces';

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of all namespaces (organizations) the authenticated
 * user has access to.
 *
 * Maps to: GET /namespaces
 */
export function listNamespaces(pagination?: PaginationParams): Promise<PaginatedList<Namespace>> {
  return openchoreoClient.get<PaginatedList<Namespace>>(BASE, pagination);
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new namespace (organization).
 * The `name` becomes the Kubernetes namespace name — lowercase, DNS-safe.
 *
 * Maps to: POST /namespaces
 */
export function createNamespace(body: CreateNamespaceRequest): Promise<Namespace> {
  return openchoreoClient.post<Namespace>(BASE, body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single namespace by its Kubernetes name.
 *
 * Maps to: GET /namespaces/{namespaceName}
 */
export function getNamespace(namespaceName: string): Promise<Namespace> {
  return openchoreoClient.get<Namespace>(`${BASE}/${namespaceName}`);
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of a namespace (displayName, description, labels).
 *
 * Maps to: PUT /namespaces/{namespaceName}
 */
export function updateNamespace(namespaceName: string, body: UpdateNamespaceRequest): Promise<Namespace> {
  return openchoreoClient.put<Namespace>(`${BASE}/${namespaceName}`, body);
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a namespace and all resources within it.
 * This is a destructive, irreversible operation.
 *
 * Maps to: DELETE /namespaces/{namespaceName}
 */
export function deleteNamespace(namespaceName: string): Promise<void> {
  return openchoreoClient.delete<void>(`${BASE}/${namespaceName}`);
}

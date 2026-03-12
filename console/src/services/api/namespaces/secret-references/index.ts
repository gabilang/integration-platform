/**
 * SecretReference endpoints (namespace-scoped).
 *
 * SecretReferences are namespace-scoped pointers to Kubernetes Secrets
 * (e.g. git credentials or registry credentials).
 *
 * OpenChoreo CRD: `SecretReference` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /namespaces/{namespaceName}/secretreferences
 *   POST   /namespaces/{namespaceName}/secretreferences
 *   GET    /namespaces/{namespaceName}/secretreferences/{srName}
 *   PUT    /namespaces/{namespaceName}/secretreferences/{srName}
 *   DELETE /namespaces/{namespaceName}/secretreferences/{srName}
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  SecretReference,
  CreateSecretReferenceRequest,
  PaginatedList,
} from '../../types';

function base(ns: string): string {
  return `/namespaces/${ns}/secretreferences`;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of secret references in the namespace.
 *
 * Maps to: GET /namespaces/{namespaceName}/secretreferences
 */
export function listSecretReferences(
  namespaceName: string,
  pagination?: PaginationParams
): Promise<PaginatedList<SecretReference>> {
  return openchoreoClient.get<PaginatedList<SecretReference>>(
    base(namespaceName),
    pagination
  );
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new secret reference in the namespace.
 *
 * Maps to: POST /namespaces/{namespaceName}/secretreferences
 */
export function createSecretReference(
  namespaceName: string,
  body: CreateSecretReferenceRequest
): Promise<SecretReference> {
  return openchoreoClient.post<SecretReference>(base(namespaceName), body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single secret reference by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/secretreferences/{srName}
 */
export function getSecretReference(
  namespaceName: string,
  srName: string
): Promise<SecretReference> {
  return openchoreoClient.get<SecretReference>(
    `${base(namespaceName)}/${srName}`
  );
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of a secret reference.
 *
 * Maps to: PUT /namespaces/{namespaceName}/secretreferences/{srName}
 */
export function updateSecretReference(
  namespaceName: string,
  srName: string,
  body: CreateSecretReferenceRequest
): Promise<SecretReference> {
  return openchoreoClient.put<SecretReference>(
    `${base(namespaceName)}/${srName}`,
    body
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a secret reference by name.
 *
 * Maps to: DELETE /namespaces/{namespaceName}/secretreferences/{srName}
 */
export function deleteSecretReference(
  namespaceName: string,
  srName: string
): Promise<void> {
  return openchoreoClient.delete<void>(`${base(namespaceName)}/${srName}`);
}

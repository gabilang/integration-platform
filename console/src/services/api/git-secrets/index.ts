/**
 * GitSecret endpoints (alpha — v1alpha1, namespace-scoped).
 *
 * GitSecrets store git credentials for private repositories.
 *
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /namespaces/{namespaceName}/gitsecrets
 *   POST   /namespaces/{namespaceName}/gitsecrets
 *   GET    /namespaces/{namespaceName}/gitsecrets/{gsName}
 *   PUT    /namespaces/{namespaceName}/gitsecrets/{gsName}
 *   DELETE /namespaces/{namespaceName}/gitsecrets/{gsName}
 */

import { openchoreoClient } from '../client';
import type { PaginationParams } from '../client';
import type {
  GitSecret,
  CreateGitSecretRequest,
  UpdateGitSecretRequest,
  PaginatedList,
} from '../types';

/** Note: git secrets use the v1alpha1 API prefix. */
function base(ns: string): string {
  return `/namespaces/${ns}/gitsecrets`;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of git secrets in the namespace.
 *
 * Maps to: GET /namespaces/{namespaceName}/gitsecrets
 */
export function listGitSecrets(
  namespaceName: string,
  pagination?: PaginationParams
): Promise<PaginatedList<GitSecret>> {
  return openchoreoClient.get<PaginatedList<GitSecret>>(
    base(namespaceName),
    pagination
  );
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new git secret in the namespace.
 *
 * Maps to: POST /namespaces/{namespaceName}/gitsecrets
 */
export function createGitSecret(
  namespaceName: string,
  body: CreateGitSecretRequest
): Promise<GitSecret> {
  return openchoreoClient.post<GitSecret>(base(namespaceName), body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single git secret by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/gitsecrets/{gsName}
 */
export function getGitSecret(
  namespaceName: string,
  gsName: string
): Promise<GitSecret> {
  return openchoreoClient.get<GitSecret>(`${base(namespaceName)}/${gsName}`);
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of a git secret.
 *
 * Maps to: PUT /namespaces/{namespaceName}/gitsecrets/{gsName}
 */
export function updateGitSecret(
  namespaceName: string,
  gsName: string,
  body: UpdateGitSecretRequest
): Promise<GitSecret> {
  return openchoreoClient.put<GitSecret>(
    `${base(namespaceName)}/${gsName}`,
    body
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a git secret by name.
 *
 * Maps to: DELETE /namespaces/{namespaceName}/gitsecrets/{gsName}
 */
export function deleteGitSecret(
  namespaceName: string,
  gsName: string
): Promise<void> {
  return openchoreoClient.delete<void>(`${base(namespaceName)}/${gsName}`);
}

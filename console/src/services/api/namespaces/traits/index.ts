/**
 * Trait endpoints (namespace-scoped).
 *
 * Traits encapsulate cross-cutting capabilities attached to components
 * (e.g. scaling, rate-limiting, mTLS, health-check).
 *
 * OpenChoreo CRD: `Trait` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /namespaces/{namespaceName}/traits
 *   POST   /namespaces/{namespaceName}/traits
 *   GET    /namespaces/{namespaceName}/traits/{traitName}
 *   PUT    /namespaces/{namespaceName}/traits/{traitName}
 *   DELETE /namespaces/{namespaceName}/traits/{traitName}
 *   GET    /namespaces/{namespaceName}/traits/{traitName}/schema
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  Trait,
  CreateTraitRequest,
  UpdateTraitRequest,
  Schema,
  PaginatedList,
} from '../../types';

function base(ns: string): string {
  return `/namespaces/${ns}/traits`;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of traits in the namespace.
 *
 * Maps to: GET /namespaces/{namespaceName}/traits
 */
export function listTraits(
  namespaceName: string,
  pagination?: PaginationParams
): Promise<PaginatedList<Trait>> {
  return openchoreoClient.get<PaginatedList<Trait>>(
    base(namespaceName),
    pagination
  );
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new trait in the namespace.
 *
 * Maps to: POST /namespaces/{namespaceName}/traits
 */
export function createTrait(
  namespaceName: string,
  body: CreateTraitRequest
): Promise<Trait> {
  return openchoreoClient.post<Trait>(base(namespaceName), body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single trait by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/traits/{traitName}
 */
export function getTrait(
  namespaceName: string,
  traitName: string
): Promise<Trait> {
  return openchoreoClient.get<Trait>(`${base(namespaceName)}/${traitName}`);
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of a trait.
 *
 * Maps to: PUT /namespaces/{namespaceName}/traits/{traitName}
 */
export function updateTrait(
  namespaceName: string,
  traitName: string,
  body: UpdateTraitRequest
): Promise<Trait> {
  return openchoreoClient.put<Trait>(
    `${base(namespaceName)}/${traitName}`,
    body
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a trait by name.
 *
 * Maps to: DELETE /namespaces/{namespaceName}/traits/{traitName}
 */
export function deleteTrait(
  namespaceName: string,
  traitName: string
): Promise<void> {
  return openchoreoClient.delete<void>(`${base(namespaceName)}/${traitName}`);
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * Returns the parameter schema for this trait.
 *
 * Maps to: GET /namespaces/{namespaceName}/traits/{traitName}/schema
 */
export function getTraitSchema(
  namespaceName: string,
  traitName: string
): Promise<Schema> {
  return openchoreoClient.get<Schema>(
    `${base(namespaceName)}/${traitName}/schema`
  );
}

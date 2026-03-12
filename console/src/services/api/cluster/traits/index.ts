/**
 * ClusterTrait endpoints (cluster-scoped).
 *
 * ClusterTraits encapsulate cross-cutting capabilities shared across namespaces
 * (e.g. scaling, rate-limiting, mTLS, health-check).
 *
 * OpenChoreo CRD: `ClusterTrait` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /clustertraits
 *   POST   /clustertraits
 *   GET    /clustertraits/{traitName}
 *   PUT    /clustertraits/{traitName}
 *   DELETE /clustertraits/{traitName}
 *   GET    /clustertraits/{traitName}/schema
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  ClusterTrait,
  CreateTraitRequest,
  UpdateTraitRequest,
  Schema,
  PaginatedList,
} from '../../types';

const BASE = '/clustertraits';

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of cluster traits.
 *
 * Maps to: GET /clustertraits
 */
export function listClusterTraits(
  pagination?: PaginationParams
): Promise<PaginatedList<ClusterTrait>> {
  return openchoreoClient.get<PaginatedList<ClusterTrait>>(BASE, pagination);
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new cluster trait.
 *
 * Maps to: POST /clustertraits
 */
export function createClusterTrait(
  body: CreateTraitRequest
): Promise<ClusterTrait> {
  return openchoreoClient.post<ClusterTrait>(BASE, body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single cluster trait by name.
 *
 * Maps to: GET /clustertraits/{traitName}
 */
export function getClusterTrait(traitName: string): Promise<ClusterTrait> {
  return openchoreoClient.get<ClusterTrait>(`${BASE}/${traitName}`);
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of a cluster trait.
 *
 * Maps to: PUT /clustertraits/{traitName}
 */
export function updateClusterTrait(
  traitName: string,
  body: UpdateTraitRequest
): Promise<ClusterTrait> {
  return openchoreoClient.put<ClusterTrait>(`${BASE}/${traitName}`, body);
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a cluster trait by name.
 *
 * Maps to: DELETE /clustertraits/{traitName}
 */
export function deleteClusterTrait(traitName: string): Promise<void> {
  return openchoreoClient.delete<void>(`${BASE}/${traitName}`);
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * Returns the parameter schema for this cluster trait.
 *
 * Maps to: GET /clustertraits/{traitName}/schema
 */
export function getClusterTraitSchema(traitName: string): Promise<Schema> {
  return openchoreoClient.get<Schema>(`${BASE}/${traitName}/schema`);
}

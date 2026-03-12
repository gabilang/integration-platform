/**
 * ClusterComponentType endpoints (cluster-scoped).
 *
 * ClusterComponentTypes define reusable workload blueprints shared across namespaces.
 *
 * OpenChoreo CRD: `ClusterComponentType` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /clustercomponenttypes
 *   POST   /clustercomponenttypes
 *   GET    /clustercomponenttypes/{ctName}
 *   PUT    /clustercomponenttypes/{ctName}
 *   DELETE /clustercomponenttypes/{ctName}
 *   GET    /clustercomponenttypes/{ctName}/schema
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  ClusterComponentType,
  CreateComponentTypeRequest,
  UpdateComponentTypeRequest,
  Schema,
  PaginatedList,
} from '../../types';

const BASE = '/clustercomponenttypes';

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of cluster component types.
 *
 * Maps to: GET /clustercomponenttypes
 */
export function listClusterComponentTypes(
  pagination?: PaginationParams
): Promise<PaginatedList<ClusterComponentType>> {
  return openchoreoClient.get<PaginatedList<ClusterComponentType>>(
    BASE,
    pagination
  );
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new cluster component type.
 *
 * Maps to: POST /clustercomponenttypes
 */
export function createClusterComponentType(
  body: CreateComponentTypeRequest
): Promise<ClusterComponentType> {
  return openchoreoClient.post<ClusterComponentType>(BASE, body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single cluster component type by name.
 *
 * Maps to: GET /clustercomponenttypes/{ctName}
 */
export function getClusterComponentType(
  ctName: string
): Promise<ClusterComponentType> {
  return openchoreoClient.get<ClusterComponentType>(`${BASE}/${ctName}`);
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of a cluster component type.
 *
 * Maps to: PUT /clustercomponenttypes/{ctName}
 */
export function updateClusterComponentType(
  ctName: string,
  body: UpdateComponentTypeRequest
): Promise<ClusterComponentType> {
  return openchoreoClient.put<ClusterComponentType>(`${BASE}/${ctName}`, body);
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a cluster component type by name.
 *
 * Maps to: DELETE /clustercomponenttypes/{ctName}
 */
export function deleteClusterComponentType(ctName: string): Promise<void> {
  return openchoreoClient.delete<void>(`${BASE}/${ctName}`);
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * Returns the parameter schema for this cluster component type.
 *
 * Maps to: GET /clustercomponenttypes/{ctName}/schema
 */
export function getClusterComponentTypeSchema(ctName: string): Promise<Schema> {
  return openchoreoClient.get<Schema>(`${BASE}/${ctName}/schema`);
}

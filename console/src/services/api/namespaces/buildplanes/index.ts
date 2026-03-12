/**
 * BuildPlane endpoints (namespace-scoped).
 *
 * BuildPlanes provide CI/CD build capacity for components in a namespace.
 *
 * OpenChoreo CRD: `BuildPlane` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /namespaces/{namespaceName}/buildplanes
 *   POST   /namespaces/{namespaceName}/buildplanes
 *   GET    /namespaces/{namespaceName}/buildplanes/{bpName}
 *   PUT    /namespaces/{namespaceName}/buildplanes/{bpName}
 *   DELETE /namespaces/{namespaceName}/buildplanes/{bpName}
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  BuildPlane,
  CreateBuildPlaneRequest,
  PaginatedList,
} from '../../types';

function base(ns: string): string {
  return `/namespaces/${ns}/buildplanes`;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of build planes in the namespace.
 *
 * Maps to: GET /namespaces/{namespaceName}/buildplanes
 */
export function listBuildPlanes(
  namespaceName: string,
  pagination?: PaginationParams
): Promise<PaginatedList<BuildPlane>> {
  return openchoreoClient.get<PaginatedList<BuildPlane>>(
    base(namespaceName),
    pagination
  );
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new build plane in the namespace.
 *
 * Maps to: POST /namespaces/{namespaceName}/buildplanes
 */
export function createBuildPlane(
  namespaceName: string,
  body: CreateBuildPlaneRequest
): Promise<BuildPlane> {
  return openchoreoClient.post<BuildPlane>(base(namespaceName), body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single build plane by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/buildplanes/{bpName}
 */
export function getBuildPlane(
  namespaceName: string,
  bpName: string
): Promise<BuildPlane> {
  return openchoreoClient.get<BuildPlane>(`${base(namespaceName)}/${bpName}`);
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of a build plane.
 *
 * Maps to: PUT /namespaces/{namespaceName}/buildplanes/{bpName}
 */
export function updateBuildPlane(
  namespaceName: string,
  bpName: string,
  body: CreateBuildPlaneRequest
): Promise<BuildPlane> {
  return openchoreoClient.put<BuildPlane>(
    `${base(namespaceName)}/${bpName}`,
    body
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a build plane by name.
 *
 * Maps to: DELETE /namespaces/{namespaceName}/buildplanes/{bpName}
 */
export function deleteBuildPlane(
  namespaceName: string,
  bpName: string
): Promise<void> {
  return openchoreoClient.delete<void>(`${base(namespaceName)}/${bpName}`);
}

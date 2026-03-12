/**
 * ObservabilityPlane endpoints (namespace-scoped).
 *
 * ObservabilityPlanes point to metrics/tracing/logging backends.
 *
 * OpenChoreo CRD: `ObservabilityPlane` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /namespaces/{namespaceName}/observabilityplanes
 *   POST   /namespaces/{namespaceName}/observabilityplanes
 *   GET    /namespaces/{namespaceName}/observabilityplanes/{opName}
 *   PUT    /namespaces/{namespaceName}/observabilityplanes/{opName}
 *   DELETE /namespaces/{namespaceName}/observabilityplanes/{opName}
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  ObservabilityPlane,
  CreateObservabilityPlaneRequest,
  PaginatedList,
} from '../../types';

function base(ns: string): string {
  return `/namespaces/${ns}/observabilityplanes`;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of observability planes in the namespace.
 *
 * Maps to: GET /namespaces/{namespaceName}/observabilityplanes
 */
export function listObservabilityPlanes(
  namespaceName: string,
  pagination?: PaginationParams
): Promise<PaginatedList<ObservabilityPlane>> {
  return openchoreoClient.get<PaginatedList<ObservabilityPlane>>(
    base(namespaceName),
    pagination
  );
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new observability plane in the namespace.
 *
 * Maps to: POST /namespaces/{namespaceName}/observabilityplanes
 */
export function createObservabilityPlane(
  namespaceName: string,
  body: CreateObservabilityPlaneRequest
): Promise<ObservabilityPlane> {
  return openchoreoClient.post<ObservabilityPlane>(base(namespaceName), body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single observability plane by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/observabilityplanes/{opName}
 */
export function getObservabilityPlane(
  namespaceName: string,
  opName: string
): Promise<ObservabilityPlane> {
  return openchoreoClient.get<ObservabilityPlane>(
    `${base(namespaceName)}/${opName}`
  );
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of an observability plane.
 *
 * Maps to: PUT /namespaces/{namespaceName}/observabilityplanes/{opName}
 */
export function updateObservabilityPlane(
  namespaceName: string,
  opName: string,
  body: CreateObservabilityPlaneRequest
): Promise<ObservabilityPlane> {
  return openchoreoClient.put<ObservabilityPlane>(
    `${base(namespaceName)}/${opName}`,
    body
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes an observability plane by name.
 *
 * Maps to: DELETE /namespaces/{namespaceName}/observabilityplanes/{opName}
 */
export function deleteObservabilityPlane(
  namespaceName: string,
  opName: string
): Promise<void> {
  return openchoreoClient.delete<void>(`${base(namespaceName)}/${opName}`);
}

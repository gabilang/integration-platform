/**
 * ReleaseBinding endpoints (namespace-scoped, component sub-resource).
 *
 * ReleaseBindings bind a ComponentRelease to an Environment with optional
 * configuration overrides. They are the primary deployment primitive.
 *
 * OpenChoreo CRD: `ReleaseBinding` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /namespaces/{namespaceName}/components/{componentName}/releasebindings
 *   POST   /namespaces/{namespaceName}/components/{componentName}/releasebindings
 *   GET    /namespaces/{namespaceName}/components/{componentName}/releasebindings/{rbName}
 *   PATCH  /namespaces/{namespaceName}/components/{componentName}/releasebindings/{rbName}
 *   DELETE /namespaces/{namespaceName}/components/{componentName}/releasebindings/{rbName}
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  ReleaseBinding,
  CreateReleaseBindingRequest,
  PatchReleaseBindingRequest,
  PaginatedList,
} from '../../types';

function base(ns: string, componentName: string): string {
  return `/namespaces/${ns}/components/${componentName}/releasebindings`;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of release bindings for the component.
 *
 * Maps to: GET /namespaces/{namespaceName}/components/{componentName}/releasebindings
 */
export function listReleaseBindings(
  namespaceName: string,
  componentName: string,
  pagination?: PaginationParams & { environment?: string }
): Promise<PaginatedList<ReleaseBinding>> {
  return openchoreoClient.get<PaginatedList<ReleaseBinding>>(
    base(namespaceName, componentName),
    pagination
  );
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new release binding.
 *
 * Maps to: POST /namespaces/{namespaceName}/components/{componentName}/releasebindings
 */
export function createReleaseBinding(
  namespaceName: string,
  componentName: string,
  body: CreateReleaseBindingRequest
): Promise<ReleaseBinding> {
  return openchoreoClient.post<ReleaseBinding>(
    base(namespaceName, componentName),
    body
  );
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single release binding by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/components/{componentName}/releasebindings/{rbName}
 */
export function getReleaseBinding(
  namespaceName: string,
  componentName: string,
  rbName: string
): Promise<ReleaseBinding> {
  return openchoreoClient.get<ReleaseBinding>(
    `${base(namespaceName, componentName)}/${rbName}`
  );
}

// ---------------------------------------------------------------------------
// Patch
// ---------------------------------------------------------------------------

/**
 * Partially updates a release binding (e.g. change release, overrides, state).
 *
 * Maps to: PATCH /namespaces/{namespaceName}/components/{componentName}/releasebindings/{rbName}
 */
export function patchReleaseBinding(
  namespaceName: string,
  componentName: string,
  rbName: string,
  body: PatchReleaseBindingRequest
): Promise<ReleaseBinding> {
  return openchoreoClient.patch<ReleaseBinding>(
    `${base(namespaceName, componentName)}/${rbName}`,
    body
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a release binding by name.
 *
 * Maps to: DELETE /namespaces/{namespaceName}/components/{componentName}/releasebindings/{rbName}
 */
export function deleteReleaseBinding(
  namespaceName: string,
  componentName: string,
  rbName: string
): Promise<void> {
  return openchoreoClient.delete<void>(
    `${base(namespaceName, componentName)}/${rbName}`
  );
}

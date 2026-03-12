/**
 * Release endpoints (namespace-scoped, component sub-resource).
 *
 * Releases are read-only views of an active ComponentRelease in a
 * specific environment. Created by the release pipeline automatically.
 *
 * OpenChoreo CRD: `Release` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /namespaces/{namespaceName}/components/{componentName}/releases
 *   GET    /namespaces/{namespaceName}/components/{componentName}/releases/{releaseName}
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type { Release, PaginatedList } from '../../types';

function base(ns: string, componentName: string): string {
  return `/namespaces/${ns}/components/${componentName}/releases`;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of releases for the component.
 *
 * Maps to: GET /namespaces/{namespaceName}/components/{componentName}/releases
 */
export function listReleases(
  namespaceName: string,
  componentName: string,
  pagination?: PaginationParams & { environment?: string }
): Promise<PaginatedList<Release>> {
  return openchoreoClient.get<PaginatedList<Release>>(
    base(namespaceName, componentName),
    pagination
  );
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single release by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/components/{componentName}/releases/{releaseName}
 */
export function getRelease(
  namespaceName: string,
  componentName: string,
  releaseName: string
): Promise<Release> {
  return openchoreoClient.get<Release>(
    `${base(namespaceName, componentName)}/${releaseName}`
  );
}

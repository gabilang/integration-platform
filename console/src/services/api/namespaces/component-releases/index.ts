/**
 * ComponentRelease endpoints (namespace-scoped, component sub-resource).
 *
 * ComponentReleases are immutable deployment snapshots created from builds
 * or manually promoted images. They are read-only via the API.
 *
 * OpenChoreo CRD: `ComponentRelease` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /namespaces/{namespaceName}/components/{componentName}/componentreleases
 *   GET    /namespaces/{namespaceName}/components/{componentName}/componentreleases/{releaseName}
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type { ComponentRelease, PaginatedList } from '../../types';

function base(ns: string, componentName: string): string {
  return `/namespaces/${ns}/components/${componentName}/componentreleases`;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of component releases.
 *
 * Maps to: GET /namespaces/{namespaceName}/components/{componentName}/componentreleases
 */
export function listComponentReleases(
  namespaceName: string,
  componentName: string,
  pagination?: PaginationParams
): Promise<PaginatedList<ComponentRelease>> {
  return openchoreoClient.get<PaginatedList<ComponentRelease>>(
    base(namespaceName, componentName),
    pagination
  );
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single component release by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/components/{componentName}/componentreleases/{releaseName}
 */
export function getComponentRelease(
  namespaceName: string,
  componentName: string,
  releaseName: string
): Promise<ComponentRelease> {
  return openchoreoClient.get<ComponentRelease>(
    `${base(namespaceName, componentName)}/${releaseName}`
  );
}

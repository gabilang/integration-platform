/**
 * Generic kubectl-style apply / delete endpoints.
 *
 * These endpoints accept raw Kubernetes-style resource manifests and
 * apply (upsert) or delete them in the OpenChoreo control plane.
 *
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   POST   /apply
 *   DELETE /apply
 */

import { openchoreoClient } from '../client';
import type { KubernetesResource } from '../types';

const BASE = '/apply';

// ---------------------------------------------------------------------------
// Apply (upsert)
// ---------------------------------------------------------------------------

/**
 * Creates or updates one or more resources from raw Kubernetes manifests.
 * Similar to `kubectl apply`.
 *
 * Maps to: POST /apply
 */
export function applyResources(
  body: KubernetesResource | KubernetesResource[]
): Promise<KubernetesResource[]> {
  return openchoreoClient.post<KubernetesResource[]>(BASE, body);
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes one or more resources identified by raw Kubernetes manifests.
 * Similar to `kubectl delete -f`.
 *
 * Maps to: DELETE /apply
 */
export function deleteResources(
  body: KubernetesResource | KubernetesResource[]
): Promise<void> {
  return openchoreoClient.delete<void>(BASE, body);
}

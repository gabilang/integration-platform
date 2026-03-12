/**
 * Component release resource tree endpoints.
 *
 * These endpoints provide a live view of the Kubernetes resources (Pods,
 * Deployments, Services, etc.) that make up a deployed component release in
 * a specific environment. Useful for the deployment status panel.
 *
 * OpenChoreo CRD: `ReleaseBinding` → `.status.resourceTree`
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET .../release/resources
 *   GET .../release/resources/events
 *   GET .../release/resources/pod-logs
 */

import { openchoreoClient } from '../../client';
import type {
  ResourceTreeResponse,
  ResourceEventsResponse,
  ResourcePodLogsResponse,
} from '../../types';

function releaseBase(
  namespaceName: string,
  projectName: string,
  componentName: string,
  environmentName: string
): string {
  return (
    `/namespaces/${namespaceName}/projects/${projectName}` +
    `/components/${componentName}` +
    `/environments/${environmentName}/release/resources`
  );
}

// ---------------------------------------------------------------------------
// Resource tree
// ---------------------------------------------------------------------------

/**
 * Returns the live Kubernetes resource tree for the component's active release
 * in the specified environment.
 *
 * The tree mirrors the Argo CD resource tree structure — nodes represent
 * Pods, Deployments, Services, HPAs, etc. with their health/sync status.
 *
 * Maps to: GET .../environments/{environmentName}/release/resources
 */
export function getReleaseResourceTree(
  namespaceName: string,
  projectName: string,
  componentName: string,
  environmentName: string
): Promise<ResourceTreeResponse> {
  return openchoreoClient.get<ResourceTreeResponse>(
    releaseBase(namespaceName, projectName, componentName, environmentName)
  );
}

// ---------------------------------------------------------------------------
// Resource events
// ---------------------------------------------------------------------------

/**
 * Returns Kubernetes Events for a specific resource in the active release.
 * Useful for diagnosing crash loops, image pull errors, etc.
 *
 * @param params.kind      - Kind of the resource (required)
 * @param params.name      - Name of the resource (required)
 * @param params.namespace - Namespace of the resource (optional)
 * @param params.uid       - UID of the resource (optional)
 *
 * Maps to: GET .../release/resources/events
 */
export function getReleaseResourceEvents(
  namespaceName: string,
  projectName: string,
  componentName: string,
  environmentName: string,
  params: {
    kind: string;
    name: string;
    namespace?: string;
    uid?: string;
  }
): Promise<ResourceEventsResponse> {
  return openchoreoClient.get<ResourceEventsResponse>(
    `${releaseBase(
      namespaceName,
      projectName,
      componentName,
      environmentName
    )}/events`,
    params
  );
}

// ---------------------------------------------------------------------------
// Pod logs
// ---------------------------------------------------------------------------

/**
 * Returns logs for a specific pod in the release resource tree.
 *
 * @param params.name          - Name of the pod (required)
 * @param params.namespace     - Namespace of the pod (required)
 * @param params.container     - Container name (optional)
 * @param params.sinceSeconds  - Only logs newer than N seconds (optional)
 *
 * Maps to: GET .../release/resources/pod-logs
 */
export function getReleaseResourcePodLogs(
  namespaceName: string,
  projectName: string,
  componentName: string,
  environmentName: string,
  params: {
    name: string;
    namespace: string;
    container?: string;
    sinceSeconds?: number;
  }
): Promise<ResourcePodLogsResponse> {
  return openchoreoClient.get<ResourcePodLogsResponse>(
    `${releaseBase(
      namespaceName,
      projectName,
      componentName,
      environmentName
    )}/pod-logs`,
    params
  );
}

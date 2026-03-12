/**
 * Environment endpoints (namespace-scoped).
 *
 * Environments represent deployment targets (e.g. dev, staging, prod) within a namespace.
 *
 * OpenChoreo CRD: `Environment` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /namespaces/{namespaceName}/environments
 *   POST   /namespaces/{namespaceName}/environments
 *   GET    /namespaces/{namespaceName}/environments/{envName}
 *   PUT    /namespaces/{namespaceName}/environments/{envName}
 *   DELETE /namespaces/{namespaceName}/environments/{envName}
 *   GET    /namespaces/{namespaceName}/environments/{envName}/observer-url
 *   GET    /namespaces/{namespaceName}/environments/{envName}/rca-agent-url
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  Environment,
  CreateEnvironmentRequest,
  UpdateEnvironmentRequest,
  ObserverURLResponse,
  RCAAgentURLResponse,
  PaginatedList,
} from '../../types';

function base(ns: string): string {
  return `/namespaces/${ns}/environments`;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of all environments in the namespace.
 *
 * Maps to: GET /namespaces/{namespaceName}/environments
 */
export function listEnvironments(
  namespaceName: string,
  pagination?: PaginationParams
): Promise<PaginatedList<Environment>> {
  return openchoreoClient.get<PaginatedList<Environment>>(
    base(namespaceName),
    pagination
  );
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new environment within the namespace.
 *
 * Maps to: POST /namespaces/{namespaceName}/environments
 */
export function createEnvironment(
  namespaceName: string,
  body: CreateEnvironmentRequest
): Promise<Environment> {
  return openchoreoClient.post<Environment>(base(namespaceName), body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single environment by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/environments/{envName}
 */
export function getEnvironment(
  namespaceName: string,
  envName: string
): Promise<Environment> {
  return openchoreoClient.get<Environment>(`${base(namespaceName)}/${envName}`);
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of an environment.
 *
 * Maps to: PUT /namespaces/{namespaceName}/environments/{envName}
 */
export function updateEnvironment(
  namespaceName: string,
  envName: string,
  body: UpdateEnvironmentRequest
): Promise<Environment> {
  return openchoreoClient.put<Environment>(
    `${base(namespaceName)}/${envName}`,
    body
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes an environment by name.
 *
 * Maps to: DELETE /namespaces/{namespaceName}/environments/{envName}
 */
export function deleteEnvironment(
  namespaceName: string,
  envName: string
): Promise<void> {
  return openchoreoClient.delete<void>(`${base(namespaceName)}/${envName}`);
}

// ---------------------------------------------------------------------------
// Observer URL
// ---------------------------------------------------------------------------

/**
 * Returns the observer URL for accessing logs and metrics for this environment.
 *
 * Maps to: GET /namespaces/{namespaceName}/environments/{envName}/observer-url
 */
export function getEnvironmentObserverURL(
  namespaceName: string,
  envName: string
): Promise<ObserverURLResponse> {
  return openchoreoClient.get<ObserverURLResponse>(
    `${base(namespaceName)}/${envName}/observer-url`
  );
}

// ---------------------------------------------------------------------------
// RCA Agent URL
// ---------------------------------------------------------------------------

/**
 * Returns the RCA agent URL for AI-powered root cause analysis for this environment.
 *
 * Maps to: GET /namespaces/{namespaceName}/environments/{envName}/rca-agent-url
 */
export function getRCAAgentURL(
  namespaceName: string,
  envName: string
): Promise<RCAAgentURLResponse> {
  return openchoreoClient.get<RCAAgentURLResponse>(
    `${base(namespaceName)}/${envName}/rca-agent-url`
  );
}

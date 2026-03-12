/**
 * ComponentType endpoints (namespace-scoped).
 *
 * ComponentTypes define reusable workload blueprints (runtime, build, expose patterns).
 *
 * OpenChoreo CRD: `ComponentType` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /namespaces/{namespaceName}/componenttypes
 *   POST   /namespaces/{namespaceName}/componenttypes
 *   GET    /namespaces/{namespaceName}/componenttypes/{ctName}
 *   PUT    /namespaces/{namespaceName}/componenttypes/{ctName}
 *   DELETE /namespaces/{namespaceName}/componenttypes/{ctName}
 *   GET    /namespaces/{namespaceName}/componenttypes/{ctName}/schema
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  ComponentType,
  CreateComponentTypeRequest,
  UpdateComponentTypeRequest,
  Schema,
  PaginatedList,
} from '../../types';

function base(ns: string): string {
  return `/namespaces/${ns}/componenttypes`;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of component types in the namespace.
 *
 * Maps to: GET /namespaces/{namespaceName}/componenttypes
 */
export function listComponentTypes(
  namespaceName: string,
  pagination?: PaginationParams
): Promise<PaginatedList<ComponentType>> {
  return openchoreoClient.get<PaginatedList<ComponentType>>(
    base(namespaceName),
    pagination
  );
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new component type in the namespace.
 *
 * Maps to: POST /namespaces/{namespaceName}/componenttypes
 */
export function createComponentType(
  namespaceName: string,
  body: CreateComponentTypeRequest
): Promise<ComponentType> {
  return openchoreoClient.post<ComponentType>(base(namespaceName), body);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single component type by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/componenttypes/{ctName}
 */
export function getComponentType(
  namespaceName: string,
  ctName: string
): Promise<ComponentType> {
  return openchoreoClient.get<ComponentType>(
    `${base(namespaceName)}/${ctName}`
  );
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of a component type.
 *
 * Maps to: PUT /namespaces/{namespaceName}/componenttypes/{ctName}
 */
export function updateComponentType(
  namespaceName: string,
  ctName: string,
  body: UpdateComponentTypeRequest
): Promise<ComponentType> {
  return openchoreoClient.put<ComponentType>(
    `${base(namespaceName)}/${ctName}`,
    body
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a component type by name.
 *
 * Maps to: DELETE /namespaces/{namespaceName}/componenttypes/{ctName}
 */
export function deleteComponentType(
  namespaceName: string,
  ctName: string
): Promise<void> {
  return openchoreoClient.delete<void>(`${base(namespaceName)}/${ctName}`);
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * Returns the parameter schema for this component type.
 *
 * Maps to: GET /namespaces/{namespaceName}/componenttypes/{ctName}/schema
 */
export function getComponentTypeSchema(
  namespaceName: string,
  ctName: string
): Promise<Schema> {
  return openchoreoClient.get<Schema>(
    `${base(namespaceName)}/${ctName}/schema`
  );
}

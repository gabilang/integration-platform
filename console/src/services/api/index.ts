/**
 * OpenChoreo API — barrel export.
 *
 * Re-exports all API modules and types for convenient single-import access.
 *
 * Usage:
 *   import { listNamespaces, createComponent, type Component } from '@/services/api';
 *   import * as api from '@/services/api';
 */

// ---------------------------------------------------------------------------
// Client & types
// ---------------------------------------------------------------------------
export { openchoreoClient, setTokenAccessor } from './client';
export type { PaginationParams } from './client';
export type * from './types';

// ---------------------------------------------------------------------------
// System
// ---------------------------------------------------------------------------
export * as system from './system';

// ---------------------------------------------------------------------------
// Namespace-scoped
// ---------------------------------------------------------------------------
export * as namespaces from './namespaces';
export * as projects from './namespaces/projects';
export * as components from './namespaces/components';
export * as releaseResources from './namespaces/components/release-resources';
export * as environments from './namespaces/environments';
export * as deploymentPipelines from './namespaces/deployment-pipelines';
export * as dataplanes from './namespaces/dataplanes';
export * as buildplanes from './namespaces/buildplanes';
export * as observabilityPlanes from './namespaces/observability-planes';
export * as componentTypes from './namespaces/component-types';
export * as traits from './namespaces/traits';
export * as workflows from './namespaces/workflows';
export * as workflowRuns from './namespaces/workflow-runs';
export * as roles from './namespaces/roles';
export * as roleBindings from './namespaces/role-bindings';
export * as secretReferences from './namespaces/secret-references';
export * as workloads from './namespaces/workloads';
export * as componentReleases from './namespaces/component-releases';
export * as releases from './namespaces/releases';
export * as releaseBindings from './namespaces/release-bindings';
export * as observabilityAlerts from './namespaces/observability-alerts';

// ---------------------------------------------------------------------------
// Cluster-scoped
// ---------------------------------------------------------------------------
export * as clusterDataplanes from './cluster/dataplanes';
export * as clusterBuildplanes from './cluster/buildplanes';
export * as clusterObservabilityPlanes from './cluster/observability-planes';
export * as clusterComponentTypes from './cluster/component-types';
export * as clusterTraits from './cluster/traits';
export * as clusterRoles from './cluster/roles';
export * as clusterRoleBindings from './cluster/role-bindings';

// ---------------------------------------------------------------------------
// Standalone
// ---------------------------------------------------------------------------
export * as authz from './authz';
export * as webhooks from './webhooks';
export * as apply from './apply';
export * as userTypes from './user-types';
export * as gitSecrets from './git-secrets';

// ---------------------------------------------------------------------------
// Devant API helpers
// ---------------------------------------------------------------------------
export * from './organizations';
export * from './types/organization';

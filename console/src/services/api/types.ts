/**
 * Shared TypeScript types for the OpenChoreo REST API.
 *
 * These interfaces mirror the OpenChoreo API contract (v0.14.x). Schemas are
 * derived from the official OpenAPI spec at:
 *   https://github.com/openchoreo/openchoreo/blob/main/openapi/openchoreo-api.yaml
 *
 * API group: openchoreo.dev/v1alpha1
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 */

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

/**
 * Pagination metadata returned alongside every paginated list.
 * Cursor-based: pass `nextCursor` as the `cursor` query param on subsequent calls.
 */
export interface Pagination {
  /** Opaque cursor to fetch the next page. Absent when there are no more pages. */
  nextCursor?: string;
  /** Number of items remaining after this page. */
  remainingCount?: number;
}

/** Standard paginated list response returned by every list endpoint. */
export interface PaginatedList<T> {
  items: T[];
  pagination?: Pagination;
}

// ---------------------------------------------------------------------------
// Common Kubernetes-style object metadata
// ---------------------------------------------------------------------------

/**
 * Kubernetes-style ObjectMeta attached to every OpenChoreo resource.
 * Mirrors `k8s.io/apimachinery/pkg/apis/meta/v1.ObjectMeta`.
 */
export interface ObjectMeta {
  /** Unique name within the namespace (or cluster-scoped). Immutable after creation. */
  name: string;
  /** Kubernetes namespace this resource lives in (= OpenChoreo organization). */
  namespace?: string;
  /** Server-assigned unique identifier (UUID v4). Read-only. */
  uid?: string;
  /** Human-readable display name shown in the UI. */
  displayName?: string;
  /** Free-form description. */
  description?: string;
  /** RFC 3339 creation timestamp. Read-only. */
  creationTimestamp?: string;
  /** RFC 3339 last-modification timestamp. Read-only. */
  updatedAt?: string;
  /** Arbitrary key-value labels for filtering/selection. */
  labels?: Record<string, string>;
  /** Non-identifying annotations for tooling/metadata. */
  annotations?: Record<string, string>;
}

/**
 * Kubernetes-style status condition.
 * Mirrors `k8s.io/apimachinery/pkg/apis/meta/v1.Condition`.
 */
export interface Condition {
  /** Type of the condition, e.g. `Ready`, `Deployed`, `BuildSucceeded`. */
  type: string;
  /** `True`, `False`, or `Unknown`. */
  status: 'True' | 'False' | 'Unknown';
  /** Machine-readable reason string for the current status. */
  reason?: string;
  /** Human-readable message describing the condition. */
  message?: string;
  /** RFC 3339 timestamp of the last transition. */
  lastTransitionTime?: string;
  /** Numeric generation the condition was observed at. */
  observedGeneration?: number;
}

// ---------------------------------------------------------------------------
// Plane references
// ---------------------------------------------------------------------------

export type PlaneRefKind =
  | 'DataPlane'
  | 'ClusterDataPlane'
  | 'BuildPlane'
  | 'ClusterBuildPlane'
  | 'ObservabilityPlane'
  | 'ClusterObservabilityPlane';

export interface PlaneRef {
  kind: PlaneRefKind;
  name: string;
}

// ---------------------------------------------------------------------------
// Error response
// ---------------------------------------------------------------------------

export type ErrorCode =
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR'
  | string;

export interface ErrorDetail {
  field?: string;
  message: string;
}

export interface ApiError {
  error: string;
  code: ErrorCode;
  details?: ErrorDetail[];
}

// ---------------------------------------------------------------------------
// Namespace (= Organization)
// ---------------------------------------------------------------------------

/** OpenChoreo Namespace CR — represents a top-level organization / tenant. */
export interface Namespace extends ObjectMeta {
  namespace?: undefined; // cluster-scoped
  status?: {
    conditions?: Condition[];
  };
}

export interface CreateNamespaceRequest {
  name: string;
  displayName?: string;
  description?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

export interface UpdateNamespaceRequest {
  displayName?: string;
  description?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------

/** OpenChoreo Project CR — groups components within a namespace. */
export interface Project extends ObjectMeta {
  /** Name of the DeploymentPipeline CR governing this project's promotions. */
  deploymentPipeline?: string;
  buildPlaneRef?: PlaneRef;
  /** RFC 3339 creation timestamp as returned by the platform API. */
  createdAt?: string;
  status?: {
    conditions?: Condition[];
  };
}

export interface CreateProjectRequest {
  name: string;
  displayName?: string;
  description?: string;
  /** Name of a DeploymentPipeline CR in the namespace. */
  deploymentPipeline: string;
  buildPlaneRef?: PlaneRef;
}

export interface UpdateProjectRequest {
  displayName?: string;
  description?: string;
  deploymentPipeline?: string;
  buildPlaneRef?: PlaneRef;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Reference to a ComponentType or ClusterComponentType CR.
 * Format: `{workloadType}/{typeName}`, e.g. `service/nodejs`.
 */
export interface ComponentTypeRef {
  /** Component type name (format: `{workloadType}/{typeName}`). */
  name: string;
  /** `ComponentType` for namespace-scoped; `ClusterComponentType` for cluster-scoped. */
  kind?: 'ComponentType' | 'ClusterComponentType';
}

export interface ComponentTrait {
  /** Name of the ClusterTrait or Trait CR. */
  name: string;
  /** Unique label for this trait instance on the component. */
  instanceName: string;
  parameters?: Record<string, unknown>;
}

/**
 * OpenChoreo Component CR — the primary deployable unit.
 * Components live at namespace scope (owner project is in spec.owner.projectName).
 */
export interface Component extends ObjectMeta {
  /** Format: `{workloadType}/{componentTypeName}`, e.g. `service/nodejs`. */
  type?: string;
  /** Reference to a ComponentType or ClusterComponentType. */
  componentType?: ComponentTypeRef | string;
  /** Project this component belongs to. */
  projectName?: string;
  /** Trigger a build automatically on source commit. */
  autoBuild?: boolean;
  /** Deploy automatically after a successful build. */
  autoDeploy?: boolean;
  parameters?: Record<string, unknown>;
  traits?: ComponentTrait[];
  status?: {
    conditions?: Condition[];
  };
}

export interface CreateComponentRequest {
  name: string;
  displayName?: string;
  description?: string;
  /** Format: `{workloadType}/{componentTypeName}`. */
  type?: string;
  componentType?: ComponentTypeRef | string;
  /** Project this component belongs to. */
  projectName?: string;
  autoBuild?: boolean;
  autoDeploy?: boolean;
  parameters?: Record<string, unknown>;
  traits?: ComponentTrait[];
}

export interface PatchComponentRequest {
  displayName?: string;
  description?: string;
  autoBuild?: boolean;
  autoDeploy?: boolean;
  parameters?: Record<string, unknown>;
  traits?: ComponentTrait[];
}

// ---------------------------------------------------------------------------
// Component schema (merged ComponentType/Trait parameter schema)
// ---------------------------------------------------------------------------

export interface SchemaParameter {
  name: string;
  type: 'string' | 'integer' | 'boolean' | 'number' | 'object' | 'array';
  description?: string;
  default?: unknown;
  required?: boolean;
  enum?: unknown[];
}

export interface Schema {
  parameters: SchemaParameter[];
}

// ---------------------------------------------------------------------------
// Workload (per-component deployment spec)
// ---------------------------------------------------------------------------

export interface EnvVar {
  key: string;
  value?: string;
  valueFrom?: {
    secretRef?: { name: string; key: string };
    configurationGroupRef?: { name: string; key: string };
  };
}

export interface ContainerPort {
  containerPort: number;
  protocol?: 'TCP' | 'UDP';
}

export interface Container {
  image?: string;
  ports?: ContainerPort[];
  env?: EnvVar[];
}

export interface WorkloadEndpoint {
  name: string;
  port: number;
  protocol?: string;
  /** URL path prefix to expose at the gateway. */
  basePath?: string;
  /** Whether this endpoint is publicly accessible. */
  isPublic?: boolean;
}

export interface WorkloadConnection {
  /** Name of the connection (e.g. a database secret reference). */
  name: string;
  type?: string;
  parameters?: Record<string, unknown>;
}

/** OpenChoreo Workload CR — declares the runtime spec for one environment. */
export interface Workload extends ObjectMeta {
  containers?: Record<string, Container>;
  endpoints?: WorkloadEndpoint[];
  connections?: WorkloadConnection[];
  status?: {
    conditions?: Condition[];
  };
}

export interface UpsertWorkloadRequest {
  containers?: Record<string, Container>;
  endpoints?: WorkloadEndpoint[];
  connections?: WorkloadConnection[];
}

// ---------------------------------------------------------------------------
// Component Release (immutable deployment snapshot)
// ---------------------------------------------------------------------------

/**
 * OpenChoreo ComponentRelease CR — immutable snapshot created from a build
 * or a manually promoted image. Read-only via the API.
 */
export interface ComponentRelease extends ObjectMeta {
  deploymentTrackRef?: string;
  buildRef?: string;
  /** For BYOC / pre-built image components. */
  image?: string;
  status?: {
    conditions?: Condition[];
  };
}

export interface CreateComponentReleaseRequest {
  /** Name to assign this release, e.g. `v1.0.0`. */
  releaseName: string;
}

// ---------------------------------------------------------------------------
// Release (promoted snapshot for an environment)
// ---------------------------------------------------------------------------

/**
 * OpenChoreo Release CR — read-only view of an active ComponentRelease in
 * a specific environment. Created by the release pipeline automatically.
 */
export interface Release extends ObjectMeta {
  environment?: string;
  componentReleaseName?: string;
  status?: {
    conditions?: Condition[];
  };
}

// ---------------------------------------------------------------------------
// Release Binding (binds a release to an environment with overrides)
// ---------------------------------------------------------------------------

export type ReleaseState = 'Active' | 'Undeploy' | 'Inactive';

export interface ContainerOverride {
  env?: EnvVar[];
  image?: string;
}

export interface WorkloadOverrides {
  containers?: Record<string, ContainerOverride>;
}

/**
 * OpenChoreo ReleaseBinding CR — the deployment primitive.
 * Binds a `ComponentRelease` to an `Environment` with optional config overrides.
 */
export interface ReleaseBinding extends ObjectMeta {
  environment: string;
  /** Name of the ComponentRelease to deploy. */
  releaseName?: string;
  state?: ReleaseState;
  componentTypeEnvOverrides?: Record<string, unknown>;
  traitOverrides?: Record<string, unknown>;
  workloadOverrides?: WorkloadOverrides;
  status?: {
    conditions?: Condition[];
  };
}

export interface CreateReleaseBindingRequest {
  name: string;
  environment: string;
  releaseName?: string;
  state?: ReleaseState;
  componentTypeEnvOverrides?: Record<string, unknown>;
  traitOverrides?: Record<string, unknown>;
  workloadOverrides?: WorkloadOverrides;
}

export interface PatchReleaseBindingRequest {
  releaseName?: string;
  state?: ReleaseState;
  componentTypeEnvOverrides?: Record<string, unknown>;
  traitOverrides?: Record<string, unknown>;
  workloadOverrides?: WorkloadOverrides;
}

// ---------------------------------------------------------------------------
// Component Binding (legacy — deployment state per environment)
// ---------------------------------------------------------------------------

/**
 * @deprecated Use ReleaseBinding instead.
 * ComponentBinding tracks the active-release state for a component in an env.
 */
export interface ComponentBinding extends ObjectMeta {
  environment: string;
  releaseState: ReleaseState;
  currentRelease?: string;
}

export interface PatchComponentBindingRequest {
  releaseState: ReleaseState;
}

// ---------------------------------------------------------------------------
// Release resource tree (runtime resource status)
// ---------------------------------------------------------------------------

export interface ResourceRef {
  group?: string;
  version: string;
  kind: string;
  namespace?: string;
  name: string;
  uid: string;
}

export interface HealthInfo {
  status: string;
  message?: string;
}

export interface ResourceTreeNode {
  group?: string;
  version: string;
  kind: string;
  namespace?: string;
  name: string;
  uid: string;
  resourceVersion?: string;
  createdAt?: string;
  parentRefs?: ResourceRef[];
  object?: Record<string, unknown>;
  health?: HealthInfo;
}

export interface ResourceTreeResponse {
  nodes: ResourceTreeNode[];
}

export interface ResourceEvent {
  type: string;
  reason?: string;
  message?: string;
  count?: number;
  firstTimestamp?: string;
  lastTimestamp?: string;
  source?: string;
}

export interface ResourceEventsResponse {
  events: ResourceEvent[];
}

export interface PodLogEntry {
  timestamp: string;
  log: string;
}

export interface ResourcePodLogsResponse {
  logEntries: PodLogEntry[];
}

/**
 * @deprecated Use PodLogEntry instead.
 */
export interface PodLog {
  container?: string;
  log?: string;
}

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

/**
 * OpenChoreo Environment CR — a named deployment target (e.g. dev, staging, prod).
 */
export interface Environment extends ObjectMeta {
  dataPlaneRef?: PlaneRef;
  isProduction?: boolean;
  /** DNS prefix used to route traffic to this environment. */
  dnsPrefix?: string;
  /** Public gateway virtual host, e.g. `api.example.com`. */
  publicVirtualHost?: string;
  /** Org-internal gateway virtual host. */
  organizationVirtualHost?: string;
  /** URL for pushing observability data (metrics, traces, logs). */
  observerUrl?: string;
  /** URL for the RCA (Root Cause Analysis) agent. */
  rcaAgentUrl?: string;
  status?: {
    conditions?: Condition[];
  };
}

export interface CreateEnvironmentRequest {
  name: string;
  displayName?: string;
  description?: string;
  dataPlaneRef: PlaneRef;
  isProduction?: boolean;
  dnsPrefix?: string;
}

export interface UpdateEnvironmentRequest {
  displayName?: string;
  description?: string;
  isProduction?: boolean;
  dnsPrefix?: string;
}

// ---------------------------------------------------------------------------
// Deployment Pipeline
// ---------------------------------------------------------------------------

export interface DeploymentPipelineStage {
  /** Name of the Environment CR this stage targets. */
  name: string;
  /** Whether manual approval is required to promote to this stage. */
  requiresApproval?: boolean;
}

/**
 * OpenChoreo DeploymentPipeline CR — defines the ordered list of environments
 * that components in a project are promoted through.
 */
export interface DeploymentPipeline extends ObjectMeta {
  stages?: DeploymentPipelineStage[];
  status?: {
    conditions?: Condition[];
  };
}

export interface CreateDeploymentPipelineRequest {
  name: string;
  displayName?: string;
  description?: string;
  stages?: DeploymentPipelineStage[];
}

export interface UpdateDeploymentPipelineRequest {
  displayName?: string;
  description?: string;
  stages?: DeploymentPipelineStage[];
}

// ---------------------------------------------------------------------------
// Data Plane
// ---------------------------------------------------------------------------

export interface GatewaySpec {
  publicVirtualHost?: string;
  organizationVirtualHost?: string;
  publicHTTPPort?: number;
  publicHTTPSPort?: number;
  organizationHTTPPort?: number;
  organizationHTTPSPort?: number;
}

export interface AgentConnectionStatus {
  connected?: boolean;
  lastHeartbeatTime?: string;
  agentVersion?: string;
}

/**
 * OpenChoreo DataPlane CR — namespace-scoped reference to a cluster
 * where workloads run.
 */
export interface DataPlane extends ObjectMeta {
  publicVirtualHost?: string;
  organizationVirtualHost?: string;
  clusterAgentClientCA?: string;
  publicHTTPPort?: number;
  publicHTTPSPort?: number;
  organizationHTTPPort?: number;
  organizationHTTPSPort?: number;
  observabilityPlaneRef?: PlaneRef;
  status?: {
    conditions?: Condition[];
    agentConnection?: AgentConnectionStatus;
  };
}

export interface CreateDataPlaneRequest {
  name: string;
  displayName?: string;
  description?: string;
  clusterAgentClientCA: string;
  publicVirtualHost: string;
  organizationVirtualHost: string;
  publicHTTPPort?: number;
  publicHTTPSPort?: number;
  organizationHTTPPort?: number;
  organizationHTTPSPort?: number;
  observabilityPlaneRef?: PlaneRef;
}

export interface UpdateDataPlaneRequest {
  displayName?: string;
  description?: string;
  publicVirtualHost?: string;
  organizationVirtualHost?: string;
  publicHTTPPort?: number;
  publicHTTPSPort?: number;
  organizationHTTPPort?: number;
  organizationHTTPSPort?: number;
  observabilityPlaneRef?: PlaneRef;
}

/**
 * OpenChoreo ClusterDataPlane CR — cluster-scoped; shared across namespaces.
 */
export interface ClusterDataPlane extends Omit<DataPlane, 'namespace'> {
  /** Unique identifier for the physical cluster. */
  planeID?: string;
}

export interface CreateClusterDataPlaneRequest extends CreateDataPlaneRequest {
  /** Unique identifier for the physical cluster. */
  planeID: string;
}

export interface UpdateClusterDataPlaneRequest extends UpdateDataPlaneRequest {
  planeID?: string;
}

// ---------------------------------------------------------------------------
// Build Plane
// ---------------------------------------------------------------------------

/** OpenChoreo BuildPlane / ClusterBuildPlane CR — provides CI build capacity. */
export interface BuildPlane extends ObjectMeta {
  status?: {
    conditions?: Condition[];
    agentConnection?: AgentConnectionStatus;
  };
}

export interface ClusterBuildPlane extends Omit<BuildPlane, 'namespace'> {}

export interface CreateBuildPlaneRequest {
  name: string;
  displayName?: string;
  description?: string;
}

// ---------------------------------------------------------------------------
// Observability Plane
// ---------------------------------------------------------------------------

/**
 * OpenChoreo ObservabilityPlane / ClusterObservabilityPlane CR —
 * points to a metrics/tracing/logging backend.
 */
export interface ObservabilityPlane extends ObjectMeta {
  /** Base URL of the observability backend (Mimir, Tempo, Loki endpoint). */
  observerUrl?: string;
  status?: {
    conditions?: Condition[];
  };
}

export interface ClusterObservabilityPlane
  extends Omit<ObservabilityPlane, 'namespace'> {}

export interface CreateObservabilityPlaneRequest {
  name: string;
  displayName?: string;
  description?: string;
  observerUrl?: string;
}

// ---------------------------------------------------------------------------
// Component Type / Cluster Component Type
// ---------------------------------------------------------------------------

/**
 * OpenChoreo ComponentType / ClusterComponentType CR —
 * defines a reusable workload blueprint (runtime, build, expose patterns).
 * Uses CEL expressions in templates (e.g. `${parameters.port}`).
 */
export interface ComponentType extends ObjectMeta {
  /** Workload category, e.g. `service`, `job`, `scheduled-task`. */
  workloadType?: string;
  schema?: Schema;
  status?: {
    conditions?: Condition[];
  };
}

export interface ClusterComponentType
  extends Omit<ComponentType, 'namespace'> {}

export interface CreateComponentTypeRequest {
  name: string;
  displayName?: string;
  description?: string;
  workloadType?: string;
  schema?: Schema;
}

export interface UpdateComponentTypeRequest {
  displayName?: string;
  description?: string;
  workloadType?: string;
  schema?: Schema;
}

// ---------------------------------------------------------------------------
// Trait / Cluster Trait
// ---------------------------------------------------------------------------

/**
 * OpenChoreo Trait / ClusterTrait CR —
 * encapsulates cross-cutting capabilities attached to components
 * (e.g. scaling, rate-limiting, mTLS, health-check).
 */
export interface Trait extends ObjectMeta {
  schema?: Schema;
  status?: {
    conditions?: Condition[];
  };
}

export interface ClusterTrait extends Omit<Trait, 'namespace'> {}

export interface CreateTraitRequest {
  name: string;
  displayName?: string;
  description?: string;
  schema?: Schema;
}

export interface UpdateTraitRequest {
  displayName?: string;
  description?: string;
  schema?: Schema;
}

// ---------------------------------------------------------------------------
// Workflow (org-level generic automation)
// ---------------------------------------------------------------------------

/**
 * OpenChoreo Workflow CR — a reusable automation template (e.g. build, test,
 * deploy) that can be triggered as a WorkflowRun.
 */
export interface Workflow extends ObjectMeta {
  schema?: Schema;
  status?: {
    conditions?: Condition[];
  };
}

export type WorkflowRunStatus =
  | 'Pending'
  | 'Running'
  | 'Succeeded'
  | 'Failed'
  | 'Cancelled';

/**
 * OpenChoreo WorkflowRun CR — a single execution of a Workflow.
 * Has sub-resources for `/status`, `/logs`, and `/events`.
 */
export interface WorkflowRun extends ObjectMeta {
  workflowName?: string;
  parameters?: Record<string, unknown>;
  status?: WorkflowRunStatus;
  startedAt?: string;
  completedAt?: string;
}

export interface WorkflowRunStatusDetails {
  phase?: WorkflowRunStatus;
  message?: string;
  startedAt?: string;
  finishedAt?: string;
  nodes?: Record<string, unknown>;
}

export interface WorkflowRunLog {
  nodeId?: string;
  displayName?: string;
  log?: string;
}

export interface WorkflowRunEvent {
  type?: string;
  reason?: string;
  message?: string;
  timestamp?: string;
}

export interface CreateWorkflowRunRequest {
  workflowName: string;
  parameters?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Component Workflow (build workflow template per component)
// ---------------------------------------------------------------------------

export interface RepositoryRevision {
  branch?: string;
  commit?: string;
}

export interface Repository {
  url: string;
  revision?: RepositoryRevision;
  /** Sub-directory path within the repository, e.g. `./services/api`. */
  appPath?: string;
}

export interface WorkflowSystemParameters {
  repository?: Repository;
}

export interface WorkflowParameters {
  workflowName: string;
  systemParameters?: WorkflowSystemParameters;
  parameters?: Record<string, unknown>;
}

/**
 * OpenChoreo ComponentWorkflow CR — the build/CI workflow template for a
 * specific component. Referenced when triggering ComponentWorkflowRuns.
 */
export interface ComponentWorkflow extends ObjectMeta {
  schema?: Schema;
}

/**
 * OpenChoreo ComponentWorkflowRun CR — one build/CI execution for a component.
 */
export interface ComponentWorkflowRun extends ObjectMeta {
  workflowName?: string;
  status?: WorkflowRunStatus;
  startedAt?: string;
  completedAt?: string;
  commit?: string;
  parameters?: Record<string, unknown>;
}

export interface TriggerComponentWorkflowRunRequest {
  parameters?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// RBAC — Namespace-scoped roles & role bindings
// ---------------------------------------------------------------------------

/**
 * OpenChoreo Role CR — namespace-scoped; lists allowed actions.
 */
export interface Role extends ObjectMeta {
  actions: string[];
}

export interface CreateRoleRequest {
  name: string;
  actions: string[];
  description?: string;
}

export interface UpdateRoleRequest {
  actions: string[];
  description?: string;
}

export interface TargetPath {
  project?: string;
  component?: string;
}

export interface RoleRef {
  name: string;
  /** Namespace of the role (for namespace roles). */
  namespace?: string;
}

export interface Entitlement {
  /** JWT claim key, e.g. `group`, `sub`, `email`. */
  claim: string;
  /** Value that must match the JWT claim. */
  value: string;
}

export type BindingEffect = 'allow' | 'deny';

/**
 * OpenChoreo RoleBinding CR — binds a JWT entitlement claim to a Role,
 * optionally scoped to a project or component.
 */
export interface RoleBinding extends ObjectMeta {
  entitlement: Entitlement;
  role: RoleRef;
  targetPath?: TargetPath;
  effect: BindingEffect;
}

export interface CreateRoleBindingRequest {
  name: string;
  entitlement: Entitlement;
  role: RoleRef;
  targetPath?: TargetPath;
  effect: BindingEffect;
}

export interface UpdateRoleBindingRequest {
  entitlement?: Entitlement;
  role?: RoleRef;
  targetPath?: TargetPath;
  effect?: BindingEffect;
}

// ---------------------------------------------------------------------------
// RBAC — Cluster-scoped roles & role bindings
// ---------------------------------------------------------------------------

/** OpenChoreo ClusterRole CR — cluster-scoped RBAC role. */
export interface ClusterRole extends Omit<ObjectMeta, 'namespace'> {
  actions: string[];
}

export interface CreateClusterRoleRequest {
  name: string;
  actions: string[];
  description?: string;
}

export interface UpdateClusterRoleRequest {
  actions: string[];
  description?: string;
}

/** OpenChoreo ClusterRoleBinding CR — binds a JWT entitlement to a ClusterRole. */
export interface ClusterRoleBinding extends Omit<ObjectMeta, 'namespace'> {
  entitlement: Entitlement;
  /** Name of the ClusterRole. */
  role: string;
  effect: BindingEffect;
}

export interface CreateClusterRoleBindingRequest {
  name: string;
  entitlement: Entitlement;
  role: string;
  effect: BindingEffect;
}

export interface UpdateClusterRoleBindingRequest {
  entitlement?: Entitlement;
  role?: string;
  effect?: BindingEffect;
}

// ---------------------------------------------------------------------------
// Secret Reference
// ---------------------------------------------------------------------------

/**
 * OpenChoreo SecretReference CR — namespace-scoped pointer to a Kubernetes
 * Secret (e.g. a git credential or registry credential).
 */
export interface SecretReference extends ObjectMeta {
  secretName?: string;
  secretNamespace?: string;
  status?: {
    conditions?: Condition[];
  };
}

export interface CreateSecretReferenceRequest {
  name: string;
  displayName?: string;
  description?: string;
  secretName?: string;
  secretNamespace?: string;
}

// ---------------------------------------------------------------------------
// Observability Alerts Notification Channel
// ---------------------------------------------------------------------------

export type NotificationChannelType =
  | 'email'
  | 'slack'
  | 'webhook'
  | 'pagerduty'
  | string;

/**
 * OpenChoreo ObservabilityAlertsNotificationChannel CR —
 * configures a destination for alerting notifications (Slack, email, webhook…).
 */
export interface ObservabilityAlertsNotificationChannel extends ObjectMeta {
  channelType?: NotificationChannelType;
  config?: Record<string, unknown>;
  status?: {
    conditions?: Condition[];
  };
}

export interface CreateObservabilityAlertsNotificationChannelRequest {
  name: string;
  displayName?: string;
  description?: string;
  channelType: NotificationChannelType;
  config?: Record<string, unknown>;
}

export interface UpdateObservabilityAlertsNotificationChannelRequest {
  displayName?: string;
  description?: string;
  channelType?: NotificationChannelType;
  config?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Git Secrets (alpha — v1alpha1)
// ---------------------------------------------------------------------------

/**
 * GitSecret resource (alpha) — stores git credentials for private repositories.
 * Served at: /namespaces/{namespaceName}/gitsecrets
 */
export interface GitSecret extends ObjectMeta {
  /** Git provider type: `github`, `gitlab`, `bitbucket`, etc. */
  provider?: string;
  /** Repository URL or URL prefix this secret applies to. */
  repositoryUrl?: string;
  status?: {
    conditions?: Condition[];
  };
}

export interface CreateGitSecretRequest {
  name: string;
  displayName?: string;
  description?: string;
  provider?: string;
  repositoryUrl?: string;
  /** Credential data (token, SSH key, etc.) — write-only. */
  credential?: Record<string, string>;
}

export interface UpdateGitSecretRequest {
  displayName?: string;
  description?: string;
  provider?: string;
  repositoryUrl?: string;
  credential?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Authorization (authz)
// ---------------------------------------------------------------------------

export interface AuthzResourceHierarchy {
  namespace?: string;
  project?: string;
  component?: string;
}

export interface AuthzResource {
  type: string;
  hierarchy: AuthzResourceHierarchy;
  id: string;
}

export interface AuthzSubjectContext {
  type: string;
  entitlement_claim: string;
  entitlement_values: string[];
}

export interface AuthzEvaluateRequest {
  resource: AuthzResource;
  action: string;
  subject_context: AuthzSubjectContext;
  context?: Record<string, unknown>;
}

export interface AuthzEvaluateResponse {
  allowed: boolean;
  reason?: string;
}

export interface AuthzBatchEvaluateRequest {
  requests: AuthzEvaluateRequest[];
}

export interface AuthzBatchEvaluateResponse {
  results: AuthzEvaluateResponse[];
}

export interface AuthzAction {
  name: string;
  description?: string;
}

export interface AuthzProfile {
  actions: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// User types
// ---------------------------------------------------------------------------

export interface UserType {
  name: string;
  description?: string;
}

// ---------------------------------------------------------------------------
// System
// ---------------------------------------------------------------------------

export interface VersionInfo {
  name: string;
  version: string;
  gitRevision: string;
  buildTime: string;
  goOS?: string;
  goArch?: string;
  goVersion?: string;
}

export interface ServerStatus {
  status: 'OK' | 'Ready' | string;
}

// ---------------------------------------------------------------------------
// Generic kubectl-style apply (manifest import)
// ---------------------------------------------------------------------------

export interface KubernetesResource {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace?: string;
    [key: string]: unknown;
  };
  spec?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Deploy / Promote / Generate-Release request types
// ---------------------------------------------------------------------------

/** Request to deploy a release. Maps to `DeployReleaseRequest` in OpenAPI. */
export interface DeployReleaseRequest {
  /** Component release name to deploy. */
  releaseName: string;
}

/** Request to promote a component between environments. Maps to `PromoteComponentRequest` in OpenAPI. */
export interface PromoteComponentRequest {
  /** Source environment name. */
  sourceEnv: string;
  /** Target environment name. */
  targetEnv: string;
}

/** Request to generate an immutable release snapshot. Maps to `GenerateReleaseRequest` in OpenAPI. */
export interface GenerateReleaseRequest {
  /** Optional release name (auto-generated if not provided). */
  releaseName?: string;
}

// ---------------------------------------------------------------------------
// Observer / RCA URL responses
// ---------------------------------------------------------------------------

export interface ObserverURLResponse {
  observerUrl?: string;
  message?: string;
}

export interface RCAAgentURLResponse {
  rcaAgentUrl?: string;
  message?: string;
}

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

export interface WebhookEventResponse {
  /** The event that was processed. */
  message?: string;
  /** Whether the webhook triggered a workflow run. */
  triggered?: boolean;
}

// ---------------------------------------------------------------------------
// Deployment Pipeline — additional types from OpenAPI spec
// ---------------------------------------------------------------------------

export interface TargetEnvironmentRef {
  name: string;
  requiresApproval?: boolean;
  isManualApprovalRequired?: boolean;
}

export interface PromotionPath {
  sourceEnvironmentRef: string;
  targetEnvironmentRefs: TargetEnvironmentRef[];
}

// ---------------------------------------------------------------------------
// File variables (for workload config)
// ---------------------------------------------------------------------------

export interface FileVar {
  key: string;
  mountPath: string;
  value?: string;
  valueFrom?: {
    secretRef?: { name: string; key: string };
  };
}

// ---------------------------------------------------------------------------
// Observability Alerts — email / webhook config
// ---------------------------------------------------------------------------

export interface NotificationEmailConfig {
  recipients?: string[];
}

export interface NotificationSecretValueFrom {
  secretKeyRef?: {
    name: string;
    key: string;
  };
}

export interface NotificationWebhookHeaderValue {
  value?: string;
  valueFrom?: NotificationSecretValueFrom;
}

export interface NotificationWebhookConfig {
  url?: string;
  headers?: Record<string, NotificationWebhookHeaderValue>;
  payloadTemplate?: string;
}

// ---------------------------------------------------------------------------
// Secret Reference — detailed spec from OpenAPI
// ---------------------------------------------------------------------------

export interface SecretTemplate {
  type?: string;
  metadata?: {
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
  };
}

export interface SecretDataSource {
  key: string;
  property?: string;
  version?: string;
}

// ---------------------------------------------------------------------------
// Workflow Run — status & log sub-resources
// ---------------------------------------------------------------------------

export interface WorkflowStepStatus {
  name: string;
  status: WorkflowRunStatus;
  startedAt?: string;
  completedAt?: string;
  message?: string;
}

export interface WorkflowRunStatusResponse {
  status: string;
  steps: WorkflowStepStatus[];
  hasLiveObservability?: boolean;
}

// ---------------------------------------------------------------------------
// User Type configuration
// ---------------------------------------------------------------------------

export interface UserTypeConfig {
  type: string;
  displayName: string;
  priority: number;
  authMechanisms?: string[];
}

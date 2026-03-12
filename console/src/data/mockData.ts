export type RuntimeRecord = {
  id: string;
  type: string;
  status: 'Running' | 'Stopped' | 'Starting';
  version: string;
  updatedAt: string;
};

export type ArtifactRecord = {
  id: string;
  name: string;
  type: string;
  version: string;
  state: 'Active' | 'Draft';
};

export type EnvironmentRecord = {
  id: string;
  name: string;
  runtimes: RuntimeRecord[];
  artifacts: ArtifactRecord[];
};

export type IntegrationRecord = {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'Healthy' | 'Building' | 'Degraded';
  repository: string;
  lastUpdated: string;
  environments: EnvironmentRecord[];
};

export type ProjectRecord = {
  id: string;
  name: string;
  description: string;
  repository: string;
  updatedAt?: string;
  integrations: IntegrationRecord[];
};

export type OrganizationRecord = {
  id: string;
  name: string;
  projects: ProjectRecord[];
};

export type CreateProjectInput = {
  displayName: string;
  name: string;
  description: string;
  repository: string;
  repositoryProvider: 'github' | 'bitbucket' | 'gitlab' | 'public-github';
  credentialId?: string;
};

export const organizations: OrganizationRecord[] = [
  {
    id: 'testorgdevant',
    name: 'testorgdevant',
    projects: [
      {
        id: 'demo',
        name: 'Demo',
        description: 'Core integration workspace for CP onboarding flows',
        repository: 'https://github.com/gabilang/integration-samples/tree/main/ballerina-integrator',
        integrations: [
          {
            id: 'cp-onboarding',
            name: 'cp-onboarding',
            description: 'Tenant onboarding synchronization flow',
            type: 'Ballerina Service',
            status: 'Healthy',
            repository: 'https://github.com/wso2-enterprise/devant-demo/tree/main/cp-onboarding',
            lastUpdated: '2026-02-19T09:32:00Z',
            environments: [
              {
                id: 'development',
                name: 'Development',
                runtimes: [
                  {
                    id: 'rt-dev-001',
                    type: 'Kubernetes',
                    status: 'Running',
                    version: '1.3.0',
                    updatedAt: '2026-02-19T09:42:00Z',
                  },
                ],
                artifacts: [
                  { id: 'a-dev-1', name: 'cp-onboarding-api', type: 'API', version: '1.0.2', state: 'Active' },
                  { id: 'a-dev-2', name: 'tenant-event-flow', type: 'Sequence', version: '0.9.8', state: 'Draft' },
                ],
              },
              {
                id: 'production',
                name: 'Production',
                runtimes: [
                  {
                    id: 'rt-prod-014',
                    type: 'Kubernetes',
                    status: 'Running',
                    version: '1.3.0',
                    updatedAt: '2026-02-19T08:20:00Z',
                  },
                ],
                artifacts: [{ id: 'a-prod-1', name: 'cp-onboarding-api', type: 'API', version: '1.0.1', state: 'Active' }],
              },
            ],
          },
          {
            id: 'sync-worker',
            name: 'sync-worker',
            description: 'Background sync and retry worker',
            type: 'Worker',
            status: 'Building',
            repository: 'https://github.com/wso2-enterprise/devant-demo/tree/main/sync-worker',
            lastUpdated: '2026-02-19T06:10:00Z',
            environments: [
              {
                id: 'development',
                name: 'Development',
                runtimes: [
                  {
                    id: 'rt-dev-002',
                    type: 'Container',
                    status: 'Starting',
                    version: '0.7.3',
                    updatedAt: '2026-02-19T06:12:00Z',
                  },
                ],
                artifacts: [{ id: 'a-dev-3', name: 'sync-worker-task', type: 'Task', version: '0.7.3', state: 'Draft' }],
              },
            ],
          },
        ],
      },
      {
        id: 'order-integrations',
        name: 'Order Integrations',
        description: 'Order processing, fulfillment, and notifications',
        repository: 'https://github.com/wso2-enterprise/devant-order-integrations',
        integrations: [
          {
            id: 'orders-api',
            name: 'orders-api',
            description: 'Order ingestion and orchestration API',
            type: 'REST API',
            status: 'Healthy',
            repository: 'https://github.com/wso2-enterprise/devant-order-integrations/tree/main/orders-api',
            lastUpdated: '2026-02-18T14:20:00Z',
            environments: [
              {
                id: 'staging',
                name: 'Staging',
                runtimes: [
                  {
                    id: 'rt-stg-104',
                    type: 'Kubernetes',
                    status: 'Running',
                    version: '2.0.0',
                    updatedAt: '2026-02-18T14:30:00Z',
                  },
                ],
                artifacts: [{ id: 'a-stg-1', name: 'orders-api', type: 'API', version: '2.0.0', state: 'Active' }],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'acme-org',
    name: 'acme-org',
    projects: [
      {
        id: 'acme-b2b',
        name: 'ACME B2B',
        description: 'B2B partner integration mesh',
        repository: 'https://github.com/wso2-enterprise/acme-b2b-integrations',
        integrations: [
          {
            id: 'partner-ingress',
            name: 'partner-ingress',
            description: 'Partner request ingress and auth layer',
            type: 'HTTP API',
            status: 'Healthy',
            repository: 'https://github.com/wso2-enterprise/acme-b2b-integrations/tree/main/partner-ingress',
            lastUpdated: '2026-02-17T17:00:00Z',
            environments: [
              {
                id: 'production',
                name: 'Production',
                runtimes: [
                  {
                    id: 'rt-prod-901',
                    type: 'Kubernetes',
                    status: 'Running',
                    version: '1.8.5',
                    updatedAt: '2026-02-17T17:05:00Z',
                  },
                ],
                artifacts: [{ id: 'a-prod-4', name: 'partner-ingress', type: 'API', version: '1.8.5', state: 'Active' }],
              },
            ],
          },
        ],
      },
    ],
  },
];

export const DEFAULT_ORGANIZATION_ID = organizations[0].id;

let runtimeOrganizations: OrganizationRecord[] = organizations;
const runtimeProjectOverrides = new Map<string, ProjectRecord[]>();

function applyProjectOverrides(nextOrganizations: OrganizationRecord[]): OrganizationRecord[] {
  return nextOrganizations.map((organization) => {
    const override = runtimeProjectOverrides.get(organization.id);
    if (!override) {
      return organization;
    }

    return {
      ...organization,
      projects: override,
    };
  });
}

function toProjectSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function buildUniqueProjectId(organization: OrganizationRecord, candidate: string): string {
  const baseId = toProjectSlug(candidate) || `project-${organization.projects.length + 1}`;
  if (!organization.projects.some((project) => project.id === baseId)) {
    return baseId;
  }

  let suffix = 2;
  while (organization.projects.some((project) => project.id === `${baseId}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseId}-${suffix}`;
}

export function setRuntimeOrganizations(nextOrganizations: OrganizationRecord[]): void {
  const baseOrganizations = nextOrganizations.length ? nextOrganizations : organizations;
  runtimeOrganizations = applyProjectOverrides(baseOrganizations);
}

export function getOrganizations(): OrganizationRecord[] {
  return runtimeOrganizations;
}

export function getDefaultOrganizationId(): string {
  return runtimeOrganizations[0]?.id ?? DEFAULT_ORGANIZATION_ID;
}

export function getOrganization(orgId: string): OrganizationRecord | undefined {
  return runtimeOrganizations.find((org) => org.id === orgId);
}

export function getProject(orgId: string, projectId: string): ProjectRecord | undefined {
  return getOrganization(orgId)?.projects.find((project) => project.id === projectId);
}

export function getIntegration(orgId: string, projectId: string, integrationId: string): IntegrationRecord | undefined {
  return getProject(orgId, projectId)?.integrations.find((integration) => integration.id === integrationId);
}

export function createProject(orgId: string, input: CreateProjectInput): ProjectRecord | undefined {
  const organization = getOrganization(orgId);
  if (!organization) {
    return undefined;
  }

  const displayName = input.displayName.trim() || 'Untitled Project';
  const projectId = buildUniqueProjectId(organization, input.name || displayName);

  const project: ProjectRecord = {
    id: projectId,
    name: displayName,
    description: input.description.trim() || 'New project created from the mock flow',
    repository: input.repository.trim(),
    integrations: [],
  };

  const nextOrganizations = runtimeOrganizations.map((runtimeOrganization) => {
    if (runtimeOrganization.id !== orgId) {
      return runtimeOrganization;
    }

    return {
      ...runtimeOrganization,
      projects: [project, ...runtimeOrganization.projects],
    };
  });

  runtimeOrganizations = nextOrganizations;
  runtimeProjectOverrides.set(orgId, nextOrganizations.find((runtimeOrganization) => runtimeOrganization.id === orgId)?.projects ?? []);

  return project;
}

export function setOrganizationProjects(orgId: string, projects: ProjectRecord[]): void {
  runtimeProjectOverrides.set(orgId, [...projects]);

  runtimeOrganizations = applyProjectOverrides(
    runtimeOrganizations.map((runtimeOrganization) =>
      runtimeOrganization.id === orgId
        ? {
            ...runtimeOrganization,
            projects: [...projects],
          }
        : runtimeOrganization
    )
  );
}

export function upsertOrganizationProject(orgId: string, project: ProjectRecord): void {
  const organization = getOrganization(orgId);
  if (!organization) {
    return;
  }

  const existingProjectIndex = organization.projects.findIndex((existingProject) => existingProject.id === project.id);

  const nextProjects =
    existingProjectIndex >= 0
      ? organization.projects.map((existingProject, index) => (index === existingProjectIndex ? project : existingProject))
      : [project, ...organization.projects];

  setOrganizationProjects(orgId, nextProjects);
}

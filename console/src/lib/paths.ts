export function organizationOverviewPath(orgId: string): string {
  return `/organizations/${orgId}`;
}

export function projectCreatePath(orgId: string): string {
  return `/organizations/${orgId}/projects/new`;
}

export function projectOverviewPath(orgId: string, projectId: string): string {
  return `/organizations/${orgId}/projects/${projectId}`;
}

export function integrationOverviewPath(orgId: string, projectId: string, integrationId: string): string {
  return `/organizations/${orgId}/projects/${projectId}/integrations/${integrationId}`;
}

export function integrationBuildPath(orgId: string, projectId: string, integrationId: string): string {
  return `/organizations/${orgId}/projects/${projectId}/integrations/${integrationId}/build`;
}

export function integrationDeployPath(orgId: string, projectId: string, integrationId: string): string {
  return `/organizations/${orgId}/projects/${projectId}/integrations/${integrationId}/deploy`;
}

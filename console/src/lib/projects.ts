import type { Project as ApiProject } from '../services/api';
import type { ProjectRecord } from '../data/mockData';

function resolveProjectRepository(project: ApiProject): string {
  const annotations = project.annotations ?? {};
  return (
    annotations.repository ||
    annotations['openchoreo.dev/repository'] ||
    annotations['choreo.dev/repository'] ||
    ''
  );
}

export function mapApiProjectToProjectRecord(project: ApiProject): ProjectRecord {
  const projectId = project.name;

  return {
    id: projectId,
    name: project.displayName?.trim() || projectId,
    description: project.description?.trim() || '',
    repository: resolveProjectRepository(project),
    updatedAt: project.updatedAt || project.creationTimestamp,
    integrations: [],
  };
}

import { getIntegration } from './mockData';

export type IntegrationBuildStatus = 'Succeeded' | 'Completed' | 'Failed' | 'Running' | 'Pending';

export type IntegrationBuild = {
  buildName: string;
  branch: string;
  commitId: string;
  status: IntegrationBuildStatus;
  startedAt: string;
  completedAt?: string;
  imageId?: string;
  logs: string[];
};

export type IntegrationDeploymentStatus = 'active' | 'deploying' | 'not-deployed' | 'failed';

export type IntegrationDeployment = {
  environmentId: string;
  environmentName: string;
  status: IntegrationDeploymentStatus;
  buildName?: string;
  imageId?: string;
  lastDeployed?: string;
  endpoints: string[];
};

const runtimeBuilds = new Map<string, IntegrationBuild[]>();
const runtimeDeployments = new Map<string, IntegrationDeployment[]>();

function integrationKey(orgId: string, projectId: string, integrationId: string): string {
  return `${orgId}/${projectId}/${integrationId}`;
}

function toOffsetIso(referenceIso: string | undefined, offsetHours: number): string {
  const baseTime = referenceIso ? new Date(referenceIso).getTime() : Date.now();
  return new Date(baseTime + offsetHours * 60 * 60 * 1000).toISOString();
}

function hashToHex(seed: string, length = 12): string {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  let value = (hash >>> 0).toString(16);
  while (value.length < length) {
    value += value;
  }

  return value.slice(0, length);
}

function toImageId(orgId: string, projectId: string, integrationId: string, buildName: string): string {
  return `registry.devant.local/${orgId}/${projectId}/${integrationId}:${buildName}`;
}

function cloneBuild(build: IntegrationBuild): IntegrationBuild {
  return {
    ...build,
    logs: [...build.logs],
  };
}

function cloneDeployment(deployment: IntegrationDeployment): IntegrationDeployment {
  return {
    ...deployment,
    endpoints: [...deployment.endpoints],
  };
}

function createDefaultBuilds(orgId: string, projectId: string, integrationId: string): IntegrationBuild[] {
  const integration = getIntegration(orgId, projectId, integrationId);
  if (!integration) {
    const statuses: IntegrationBuildStatus[] = ['Succeeded', 'Failed'];
    const now = new Date().toISOString();

    return statuses.map((status, index) => {
      const buildNumber = 32 - index;
      const buildName = `${integrationId}-build-${buildNumber}`;
      const startedAt = toOffsetIso(now, index * -7);
      const completedAt = status === 'Failed' ? toOffsetIso(now, index * -7 + 1) : toOffsetIso(now, index * -7 + 2);
      const commitId = hashToHex(`${integrationId}:${buildName}`, 40);
      const imageId = status === 'Succeeded' || status === 'Completed' ? toImageId(orgId, projectId, integrationId, buildName) : undefined;

      return {
        buildName,
        branch: 'main',
        commitId,
        status,
        startedAt,
        completedAt,
        imageId,
        logs: [
          `[${startedAt}] Build queued for ${integrationId}.`,
          '[build] Resolving repository source.',
          status === 'Failed' ? '[build] Build failed during test phase.' : '[build] Build completed successfully.',
        ],
      };
    });
  }

  const latestStatus: IntegrationBuildStatus = integration.status === 'Building' ? 'Running' : 'Succeeded';
  const statuses: IntegrationBuildStatus[] = [latestStatus, 'Succeeded', 'Failed'];

  return statuses.map((status, index) => {
    const buildNumber = 103 - index;
    const buildName = `${integrationId}-build-${buildNumber}`;
    const startedAt = toOffsetIso(integration.lastUpdated, index * -9);
    const completedAt =
      status === 'Running' || status === 'Pending' ? undefined : toOffsetIso(integration.lastUpdated, index * -9 + 1);
    const commitId = hashToHex(`${integrationId}:${buildName}`, 40);
    const imageId = status === 'Succeeded' || status === 'Completed' ? toImageId(orgId, projectId, integrationId, buildName) : undefined;

    return {
      buildName,
      branch: 'main',
      commitId,
      status,
      startedAt,
      completedAt,
      imageId,
      logs: [
        `[${startedAt}] Build queued for ${integration.name}.`,
        `[${startedAt}] Cloning repository ${integration.repository}.`,
        status === 'Failed'
          ? '[build] Build failed during containerization step.'
          : status === 'Running' || status === 'Pending'
            ? '[build] Build is currently running.'
            : '[build] Build completed successfully.',
      ],
    };
  });
}

function createDefaultDeployments(orgId: string, projectId: string, integrationId: string): IntegrationDeployment[] {
  const integration = getIntegration(orgId, projectId, integrationId);
  if (!integration) {
    return [];
  }

  const builds = ensureBuilds(orgId, projectId, integrationId);
  const latestDeployableBuild = builds.find((build) => isBuildDeployable(build.status));

  return integration.environments.map((environment) => {
    const hasActiveArtifacts = environment.artifacts.some((artifact) => artifact.state === 'Active');
    const status: IntegrationDeploymentStatus = hasActiveArtifacts ? 'active' : 'not-deployed';
    const buildName = hasActiveArtifacts ? latestDeployableBuild?.buildName : undefined;
    const imageId =
      hasActiveArtifacts && latestDeployableBuild
        ? latestDeployableBuild.imageId ?? toImageId(orgId, projectId, integrationId, latestDeployableBuild.buildName)
        : undefined;
    const endpoint = `https://${integrationId}-${environment.id}.${orgId}.apps.devant.local`;

    return {
      environmentId: environment.id,
      environmentName: environment.name,
      status,
      buildName,
      imageId,
      lastDeployed: hasActiveArtifacts ? environment.runtimes[0]?.updatedAt ?? integration.lastUpdated : undefined,
      endpoints: hasActiveArtifacts ? [endpoint] : [],
    };
  });
}

function ensureBuilds(orgId: string, projectId: string, integrationId: string): IntegrationBuild[] {
  const key = integrationKey(orgId, projectId, integrationId);
  if (!runtimeBuilds.has(key)) {
    runtimeBuilds.set(key, createDefaultBuilds(orgId, projectId, integrationId));
  }
  return runtimeBuilds.get(key) ?? [];
}

function ensureDeployments(orgId: string, projectId: string, integrationId: string): IntegrationDeployment[] {
  const key = integrationKey(orgId, projectId, integrationId);
  if (!runtimeDeployments.has(key)) {
    runtimeDeployments.set(key, createDefaultDeployments(orgId, projectId, integrationId));
  }
  return runtimeDeployments.get(key) ?? [];
}

export function isBuildDeployable(status: IntegrationBuildStatus): boolean {
  return status === 'Succeeded' || status === 'Completed';
}

export function getIntegrationBuilds(orgId: string, projectId: string, integrationId: string): IntegrationBuild[] {
  return ensureBuilds(orgId, projectId, integrationId).map(cloneBuild);
}

export function triggerIntegrationBuild(orgId: string, projectId: string, integrationId: string, branch = 'main'): IntegrationBuild[] {
  const key = integrationKey(orgId, projectId, integrationId);
  const builds = ensureBuilds(orgId, projectId, integrationId);
  const startedAt = new Date().toISOString();
  const buildName = `${integrationId}-build-${Date.now().toString().slice(-5)}`;
  const commitId = hashToHex(`${key}:${buildName}:${startedAt}`, 40);

  const nextBuild: IntegrationBuild = {
    buildName,
    branch,
    commitId,
    status: 'Running',
    startedAt,
    logs: [
      `[${startedAt}] Build queued for execution.`,
      '[build] Fetching source...',
      '[build] Running buildpack steps...',
      '[build] Waiting for completion...',
    ],
  };

  runtimeBuilds.set(key, [nextBuild, ...builds]);
  return getIntegrationBuilds(orgId, projectId, integrationId);
}

export function getIntegrationDeployments(orgId: string, projectId: string, integrationId: string): IntegrationDeployment[] {
  return ensureDeployments(orgId, projectId, integrationId).map(cloneDeployment);
}

export function deployIntegrationBuild(
  orgId: string,
  projectId: string,
  integrationId: string,
  environmentId: string,
  buildName: string
): IntegrationDeployment[] {
  const key = integrationKey(orgId, projectId, integrationId);
  const builds = ensureBuilds(orgId, projectId, integrationId);
  const deployments = ensureDeployments(orgId, projectId, integrationId);
  const integration = getIntegration(orgId, projectId, integrationId);
  const targetEnvironmentName =
    integration?.environments.find((environment) => environment.id === environmentId)?.name ||
    deployments.find((deployment) => deployment.environmentId === environmentId)?.environmentName ||
    environmentId;
  const build = builds.find((item) => item.buildName === buildName);

  if (!build) {
    return deployments.map(cloneDeployment);
  }

  const imageId = build.imageId ?? toImageId(orgId, projectId, integrationId, build.buildName);
  const updatedDeployment: IntegrationDeployment = {
    environmentId,
    environmentName: targetEnvironmentName,
    status: 'active',
    buildName: build.buildName,
    imageId,
    lastDeployed: new Date().toISOString(),
    endpoints: [`https://${integrationId}-${environmentId}.${orgId}.apps.devant.local`],
  };

  const existingIndex = deployments.findIndex((deployment) => deployment.environmentId === environmentId);
  const nextDeployments =
    existingIndex >= 0
      ? deployments.map((deployment, index) => (index === existingIndex ? updatedDeployment : deployment))
      : [...deployments, updatedDeployment];

  runtimeDeployments.set(key, nextDeployments);
  return nextDeployments.map(cloneDeployment);
}

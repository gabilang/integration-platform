import { useCallback, useEffect, useState } from 'react';
import { useAsgardeo } from '../../auth';
import { env } from '../../config/env';
import type { OrganizationUnit } from './types/organization';

type HttpRequestConfig = Parameters<ReturnType<typeof useAsgardeo>['http']['request']>[0];

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeOrganization(raw: unknown): OrganizationUnit | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const id = asNonEmptyString(data.id) ?? asNonEmptyString(data.uuid);
  const handle = asNonEmptyString(data.handle) ?? asNonEmptyString(data.orgHandle);
  const name = asNonEmptyString(data.name) ?? asNonEmptyString(data.displayName);

  const resolvedId = id ?? handle ?? name;
  const resolvedHandle = handle ?? id ?? name;
  const resolvedName = name ?? handle ?? id;

  if (!resolvedId || !resolvedHandle || !resolvedName) {
    return null;
  }

  return {
    id: resolvedId,
    handle: resolvedHandle,
    name: resolvedName,
    description: asNonEmptyString(data.description),
  };
}

function normalizeOrganizations(payload: unknown): OrganizationUnit[] {
  const rawList = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as Record<string, unknown>).organizations)
      ? ((payload as Record<string, unknown>).organizations as unknown[])
      : [];

  const deduped = new Map<string, OrganizationUnit>();
  for (const item of rawList) {
    const organization = normalizeOrganization(item);
    if (!organization) {
      continue;
    }
    deduped.set(organization.handle, organization);
  }

  return Array.from(deduped.values());
}

export async function fetchOrganizations(
  request: (config: HttpRequestConfig) => Promise<{ data: unknown }>
): Promise<OrganizationUnit[]> {
  const url = `${env.VITE_THUNDER_URL}/organization-units`;
  const response = await request({
    url,
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  } as HttpRequestConfig);

  return normalizeOrganizations(response.data);
}

export function useOrganizations() {
  const { http, isSignedIn } = useAsgardeo();
  const [organizations, setOrganizations] = useState<OrganizationUnit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const loadOrganizations = useCallback(async () => {
    if (!isSignedIn) {
      setOrganizations([]);
      setError(null);
      setIsLoading(false);
      setHasLoadedOnce(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextOrganizations = await fetchOrganizations(http.request);
      setOrganizations(nextOrganizations);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError : new Error('Failed to load organizations'));
      setOrganizations([]);
    } finally {
      setIsLoading(false);
      setHasLoadedOnce(true);
    }
  }, [http.request, isSignedIn]);

  useEffect(() => {
    void loadOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  return {
    organizations,
    isLoading: isSignedIn && (!hasLoadedOnce || isLoading),
    error,
    refetch: loadOrganizations,
  };
}

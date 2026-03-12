import { useEffect, useMemo, useState } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Box, CircularProgress } from '@wso2/oxygen-ui';
import { setToken, type OrganizationUnit, useOrganizations } from './services/api';
import { useAsgardeo } from './auth';
import { useUserClaims } from './auth/useUserClaims';
import { getDefaultOrganizationId, organizations as mockOrganizations, setRuntimeOrganizations, type OrganizationRecord } from './data/mockData';
import DevantLayout from './layouts/DevantLayout';
import { organizationOverviewPath } from './lib/paths';
import IntegrationOverviewPage from './pages/IntegrationOverviewPage';
import OrganizationOverviewPage from './pages/OrganizationOverviewPage';
import { AutoRedirectToIdP } from './pages/AutoRedirectToIdP';
import ProjectCreatePage from './pages/ProjectCreatePage';
import ProjectOverviewPage from './pages/ProjectOverviewPage';
import BuildPage from './pages/BuildPage';
import DeployPage from './pages/DeployPage';

let hasInitialized = false;
let hasValidated = false;

function normalizeOrganizationId(value: string): string {
  return value.trim().toLowerCase();
}

function resolveClaimOrganization(claims: Record<string, unknown> | null): OrganizationRecord | undefined {
  if (!claims) {
    return undefined;
  }

  const claimName = typeof claims.ouName === 'string' && claims.ouName.trim().length > 0 ? claims.ouName.trim() : undefined;
  const claimHandle =
    typeof claims.ouHandle === 'string' && claims.ouHandle.trim().length > 0 ? claims.ouHandle.trim() : undefined;
  const claimId = typeof claims.ouId === 'string' && claims.ouId.trim().length > 0 ? claims.ouId.trim() : undefined;

  const resolvedId = claimHandle || claimId || claimName;
  const resolvedName = claimName || claimHandle || claimId;

  if (!resolvedId || !resolvedName) {
    return undefined;
  }

  return {
    id: resolvedId,
    name: resolvedName,
    projects: [],
  };
}

function getRuntimeOrganizationId(organization: OrganizationUnit): string {
  return organization.handle || organization.id || organization.name;
}

function getOrganizationAliases(organization: OrganizationUnit): string[] {
  return [organization.handle, organization.id, organization.name]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .map(normalizeOrganizationId);
}

function buildRuntimeOrganizations(
  apiOrganizations: OrganizationUnit[],
  claims: Record<string, unknown> | null
): OrganizationRecord[] {
  const claimOrganization = resolveClaimOrganization(claims);

  if (!apiOrganizations.length) {
    if (claimOrganization) {
      const matchingMock = mockOrganizations.find(
        (organization) =>
          normalizeOrganizationId(organization.id) === normalizeOrganizationId(claimOrganization.id) ||
          normalizeOrganizationId(organization.name) === normalizeOrganizationId(claimOrganization.name)
      );

      if (matchingMock) {
        return [
          {
            ...matchingMock,
            id: claimOrganization.id,
            name: claimOrganization.name,
          },
        ];
      }

      return [claimOrganization];
    }

    return mockOrganizations;
  }

  const matched = apiOrganizations.map((organization) => {
    const runtimeId = getRuntimeOrganizationId(organization);
    const candidates = getOrganizationAliases(organization);

    const mockMatch = mockOrganizations.find((mockOrganization) => {
      const mockId = normalizeOrganizationId(mockOrganization.id);
      const mockName = normalizeOrganizationId(mockOrganization.name);
      return candidates.some((candidate) => candidate === mockId || candidate === mockName);
    });

    if (!mockMatch) {
      return {
        id: runtimeId,
        name: organization.name || organization.handle || organization.id,
        projects: [],
      };
    }

    return {
      ...mockMatch,
      id: runtimeId,
      name: organization.name || mockMatch.name,
    };
  });

  const deduplicated = new Map<string, OrganizationRecord>();
  for (const organization of matched) {
    deduplicated.set(organization.id, organization);
  }

  if (claimOrganization) {
    const claimCandidate = normalizeOrganizationId(claimOrganization.id);
    const hasClaimOrganization = Array.from(deduplicated.values()).some(
      (organization) =>
        normalizeOrganizationId(organization.id) === claimCandidate ||
        normalizeOrganizationId(organization.name) === claimCandidate
    );

    if (!hasClaimOrganization) {
      deduplicated.set(claimOrganization.id, claimOrganization);
    }
  }

  return Array.from(deduplicated.values());
}

function resolveDefaultOrganizationId(
  claims: Record<string, unknown> | null,
  organizations: OrganizationRecord[],
  apiOrganizations: OrganizationUnit[]
): string {
  const fallbackOrganizationId = organizations[0]?.id ?? getDefaultOrganizationId();
  const findRuntimeByCandidate = (candidate: string) =>
    organizations.find((organization) => {
      const orgId = normalizeOrganizationId(organization.id);
      const orgName = normalizeOrganizationId(organization.name);
      return candidate === orgId || candidate === orgName;
    });
  const findApiByCandidate = (candidate: string) =>
    apiOrganizations.find((organization) => getOrganizationAliases(organization).some((alias) => alias === candidate));

  if (typeof window !== 'undefined') {
    const requestedOrg = new URLSearchParams(window.location.search).get('org')?.trim().toLowerCase();
    if (requestedOrg) {
      const requestedMatch = findRuntimeByCandidate(requestedOrg);
      if (requestedMatch) {
        return requestedMatch.id;
      }

      const requestedApiMatch = findApiByCandidate(requestedOrg);
      if (requestedApiMatch) {
        const runtimeId = getRuntimeOrganizationId(requestedApiMatch);
        return organizations.some((organization) => organization.id === runtimeId) ? runtimeId : fallbackOrganizationId;
      }
    }
  }

  if (!claims) {
    return fallbackOrganizationId;
  }

  const claimCandidates = [claims.ouHandle, claims.ouName, claims.ouId]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .map(normalizeOrganizationId);

  const matched = claimCandidates.map(findRuntimeByCandidate).find((organization) => Boolean(organization));
  if (matched) {
    return matched.id;
  }

  const apiMatched = claimCandidates.map(findApiByCandidate).find((organization) => Boolean(organization));
  if (apiMatched) {
    const runtimeId = getRuntimeOrganizationId(apiMatched);
    return organizations.some((organization) => organization.id === runtimeId) ? runtimeId : fallbackOrganizationId;
  }

  return fallbackOrganizationId;
}

export function App() {
  const { isLoading, isSignedIn, getDecodedIdToken, getAccessToken, signOut } = useAsgardeo();
  const { claims, isLoading: isClaimsLoading } = useUserClaims();
  const { organizations: apiOrganizations, isLoading: isOrganizationsLoading } = useOrganizations();
  const [isValidatingToken, setIsValidatingToken] = useState(true);

  const runtimeOrganizations = useMemo(() => {
    return buildRuntimeOrganizations(apiOrganizations, (claims as Record<string, unknown> | null) ?? null);
  }, [apiOrganizations, claims]);
  setRuntimeOrganizations(runtimeOrganizations);

  useEffect(() => {
    const synchronizeAccessToken = async () => {
      if (!isSignedIn) {
        setToken('');
        return;
      }

      try {
        const accessToken = await getAccessToken();
        setToken(accessToken || '');
      } catch (error) {
        console.error('[Devant App] Failed to load access token for OpenChoreo API:', error);
        setToken('');
      }
    };

    void synchronizeAccessToken();
  }, [getAccessToken, isSignedIn]);

  useEffect(() => {
    const validateToken = async () => {
      if (hasValidated) {
        return;
      }

      if (isLoading && !hasInitialized) {
        return;
      }

      if (!isLoading && !hasInitialized) {
        hasInitialized = true;
      }

      if (!isSignedIn) {
        hasValidated = true;
        setIsValidatingToken(false);
        return;
      }

      try {
        const decodedToken = await getDecodedIdToken();
        const exp = decodedToken?.exp as number | undefined;
        const now = Math.floor(Date.now() / 1000);

        if (exp !== undefined && exp < now) {
          hasValidated = true;
          await signOut();
          return;
        }
      } catch (error) {
        console.error('[Devant App] Token validation failed:', error);
      }

      hasValidated = true;
      setIsValidatingToken(false);
    };

    validateToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isSignedIn]);

  const defaultOrganizationId = useMemo(() => {
    return resolveDefaultOrganizationId(
      (claims as Record<string, unknown> | null) ?? null,
      runtimeOrganizations,
      apiOrganizations
    );
  }, [claims, runtimeOrganizations, apiOrganizations]);

  const defaultOrgPath = organizationOverviewPath(defaultOrganizationId);

  if ((isLoading && !hasInitialized) || isValidatingToken || (isSignedIn && (isClaimsLoading || isOrganizationsLoading))) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isSignedIn ? <Navigate to={defaultOrgPath} replace /> : <AutoRedirectToIdP />} />

      <Route element={isSignedIn ? <DevantLayout /> : <Navigate to="/login" replace />}>
        <Route path="/" element={<Navigate to={defaultOrgPath} replace />} />
        <Route path="/organizations/:orgId" element={<OrganizationOverviewPage />} />
        <Route path="/organizations/:orgId/projects/new" element={<ProjectCreatePage />} />
        <Route path="/organizations/:orgId/projects/:projectId" element={<ProjectOverviewPage />} />
        <Route path="/organizations/:orgId/projects/:projectId/integrations/:integrationId" element={<Outlet />}>
          <Route index element={<IntegrationOverviewPage />} />
          <Route path="build" element={<BuildPage />} />
          <Route path="deploy" element={<DeployPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={isSignedIn ? defaultOrgPath : '/login'} replace />} />
    </Routes>
  );
}

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { matchPath, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  AppShell,
  Box,
  Button,
  ColorSchemeToggle,
  ComplexSelect,
  Footer,
  Header,
  IconButton,
  Sidebar,
  Stack,
  UserMenu,
} from '@wso2/oxygen-ui';
import {
  BarChart3,
  Building,
  ChevronRight,
  Compass,
  FlaskConical,
  LayoutDashboard,
  Rocket,
  ScrollText,
  Settings,
  Shield,
  Workflow,
  Wrench,
} from '@wso2/oxygen-ui-icons-react';
import { useAsgardeo } from '../auth';
import { useUserClaims } from '../auth/useUserClaims';
import { env } from '../config/env';
import { getDefaultOrganizationId, getIntegration, getOrganization, getOrganizations, getProject } from '../data/mockData';
import {
  integrationBuildPath,
  integrationDeployPath,
  integrationOverviewPath,
  organizationOverviewPath,
  projectOverviewPath,
} from '../lib/paths';

function normalizeClaimValue(value: string): string {
  return value.trim().toLowerCase();
}

export default function DevantLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAsgardeo();
  const { claims } = useUserClaims();
  const { orgId, projectId, integrationId } = useParams();

  const [collapsed, setCollapsed] = useState(false);
  const organizations = getOrganizations();

  const selectedOrg = useMemo(() => {
    const fallbackOrganization = organizations[0];
    if (!fallbackOrganization) {
      return undefined;
    }

    if (!orgId) {
      return getOrganization(getDefaultOrganizationId()) ?? fallbackOrganization;
    }
    return getOrganization(orgId) ?? fallbackOrganization;
  }, [orgId, organizations]);

  if (!selectedOrg) {
    return null;
  }

  const selectedProject = useMemo(() => {
    if (!selectedOrg.projects.length) {
      return undefined;
    }
    if (!projectId) {
      return selectedOrg.projects[0];
    }
    return getProject(selectedOrg.id, projectId) ?? selectedOrg.projects[0];
  }, [projectId, selectedOrg]);

  const selectedIntegration = useMemo(() => {
    if (!selectedProject?.integrations.length) {
      return undefined;
    }
    if (!integrationId) {
      return selectedProject.integrations[0];
    }
    return getIntegration(selectedOrg.id, selectedProject.id, integrationId) ?? selectedProject.integrations[0];
  }, [integrationId, selectedOrg.id, selectedProject]);

  const inProjectLevel = Boolean(projectId);
  const inIntegrationLevel = Boolean(projectId && integrationId);
  const inOrganizationLevel = !inProjectLevel;
  const hasIntegrationRouteParams = Boolean(orgId && projectId && integrationId);
  const routeOrgId = orgId ?? selectedOrg.id;
  const routeProjectId = projectId ?? selectedProject?.id ?? '';
  const routeIntegrationId = integrationId ?? selectedIntegration?.id ?? '';

  const orgPath = organizationOverviewPath(selectedOrg.id);
  const projectPath = selectedProject ? projectOverviewPath(selectedOrg.id, selectedProject.id) : orgPath;
  const integrationPath = hasIntegrationRouteParams
    ? integrationOverviewPath(routeOrgId, routeProjectId, routeIntegrationId)
    : projectPath;
  const integrationBuildRoute = hasIntegrationRouteParams
    ? integrationBuildPath(routeOrgId, routeProjectId, routeIntegrationId)
    : integrationPath;
  const integrationDeployRoute = hasIntegrationRouteParams
    ? integrationDeployPath(routeOrgId, routeProjectId, routeIntegrationId)
    : integrationPath;
  const integrationSelectorItems: Array<{ id: string; name: string; type: string; description?: string }> =
    selectedProject?.integrations.length
      ? selectedProject.integrations.map((integration) => ({
          id: integration.id,
          name: integration.name,
          type: integration.type,
          description: integration.description,
        }))
      : integrationId
        ? [{ id: integrationId, name: integrationId, type: 'Component' }]
        : [];
  const activeSidebarItem = useMemo(() => {
    if (
      matchPath('/organizations/:orgId/projects/:projectId/integrations/:integrationId/build/*', location.pathname) ||
      location.pathname.endsWith('/build')
    ) {
      return 'build';
    }
    if (
      matchPath('/organizations/:orgId/projects/:projectId/integrations/:integrationId/deploy/*', location.pathname) ||
      location.pathname.endsWith('/deploy')
    ) {
      return 'deploy';
    }
    return 'overview';
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut();
      const fallbackUrl = env.VITE_THUNDER_AFTER_SIGN_OUT_URL || '/login';
      window.location.assign(fallbackUrl);
    } catch {
      window.location.assign('/login');
    }
  };

  const userName =
    (typeof claims?.name === 'string' && claims.name) ||
    (typeof claims?.email === 'string' && claims.email) ||
    'Devant User';
  const userEmail = (typeof claims?.email === 'string' && claims.email) || '';

  const tokenOrganizationName =
    typeof claims?.ouName === 'string' && claims.ouName.trim().length > 0 ? claims.ouName.trim() : undefined;
  const tokenOrganizationHandle =
    typeof claims?.ouHandle === 'string' && claims.ouHandle.trim().length > 0 ? claims.ouHandle.trim() : undefined;
  const tokenOrganizationId =
    typeof claims?.ouId === 'string' && claims.ouId.trim().length > 0 ? claims.ouId.trim() : undefined;
  const tokenOrganizationLabel = tokenOrganizationName || tokenOrganizationHandle;
  const tokenOrganizationCandidates = [tokenOrganizationId, tokenOrganizationHandle, tokenOrganizationName]
    .filter((candidate): candidate is string => Boolean(candidate))
    .map(normalizeClaimValue);

  const doesOrganizationMatchToken = (organization: { id: string; name: string }) => {
    const organizationAliases = [organization.id, organization.name].map(normalizeClaimValue);
    return tokenOrganizationCandidates.some((candidate) => organizationAliases.includes(candidate));
  };

  const selectedOrganizationLabel =
    tokenOrganizationLabel && doesOrganizationMatchToken(selectedOrg) ? tokenOrganizationLabel : selectedOrg.name;

  const renderValueWithLabel = (label: string, value: string, icon: ReactNode) => (
    <>
      <ComplexSelect.MenuItem.Icon>{icon}</ComplexSelect.MenuItem.Icon>
      <ComplexSelect.MenuItem.Text primary={value} secondary={label} />
    </>
  );

  return (
    <AppShell>
      <AppShell.Navbar>
        <Header>
          <Header.Toggle collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />

          <Header.Brand>
            <Header.BrandLogo>
              <img src="/WSO2_Integration_Platform_Black.svg" alt="WSO2 Integration Platform" style={{ height: 32 }} />
            </Header.BrandLogo>
          </Header.Brand>

          <Header.Switchers showDivider={false}>
            <Stack direction="row" alignItems="center" gap={0.5}>
              <ComplexSelect
                value={selectedOrg.id}
                onChange={(event) => navigate(organizationOverviewPath(String(event.target.value)))}
                size="small"
                sx={{ minWidth: 220 }}
                renderValue={() => renderValueWithLabel('Organization', selectedOrganizationLabel, <Building size={16} />)}
                label="Organizations"
              >
                {organizations.map((organization) => (
                  <ComplexSelect.MenuItem key={organization.id} value={organization.id}>
                    {renderValueWithLabel(
                      'Organization',
                      tokenOrganizationLabel && doesOrganizationMatchToken(organization)
                        ? tokenOrganizationLabel
                        : organization.name,
                      <Building size={16} />
                    )}
                  </ComplexSelect.MenuItem>
                ))}
              </ComplexSelect>

              {inOrganizationLevel && selectedProject && (
                <IconButton size="small" onClick={() => navigate(projectPath)}>
                  <ChevronRight size={14} />
                </IconButton>
              )}
            </Stack>

            {inProjectLevel && selectedProject && (
              <Stack direction="row" alignItems="center" gap={0.5}>
                <ComplexSelect
                  value={selectedProject.id}
                  onChange={(event) => navigate(projectOverviewPath(selectedOrg.id, String(event.target.value)))}
                  size="small"
                  sx={{ minWidth: 190 }}
                  renderValue={() => renderValueWithLabel('Project', selectedProject.name, <Compass size={16} />)}
                  label="Projects"
                >
                  {selectedOrg.projects.map((project) => (
                    <ComplexSelect.MenuItem key={project.id} value={project.id}>
                      <ComplexSelect.MenuItem.Text primary={project.name} secondary={project.description} />
                    </ComplexSelect.MenuItem>
                  ))}
                </ComplexSelect>
                <IconButton size="small" onClick={() => navigate(projectPath)}>
                  <ChevronRight size={14} />
                </IconButton>
              </Stack>
            )}

            {inIntegrationLevel && selectedProject && (
              <Stack direction="row" alignItems="center" gap={0.5}>
                <ComplexSelect
                  value={integrationId || selectedIntegration?.id || ''}
                  onChange={(event) =>
                    navigate(integrationOverviewPath(selectedOrg.id, selectedProject.id, String(event.target.value)))
                  }
                  size="small"
                  sx={{ minWidth: 190 }}
                  renderValue={() =>
                    renderValueWithLabel('Integration', selectedIntegration?.name || integrationId || 'Component', <Workflow size={16} />)
                  }
                  label="Integrations"
                >
                  {integrationSelectorItems.map((integration) => (
                    <ComplexSelect.MenuItem key={integration.id} value={integration.id}>
                      <ComplexSelect.MenuItem.Text primary={integration.name} secondary={integration.type} />
                    </ComplexSelect.MenuItem>
                  ))}
                </ComplexSelect>
              </Stack>
            )}
          </Header.Switchers>

          <Header.Spacer />

          <Header.Actions>
            <ColorSchemeToggle />
            <Button size="small" variant="outlined" startIcon={<Shield size={14} />}>
              Developer (Default)
            </Button>
            <Button size="small" variant="contained" color="warning">
              Upgrade
            </Button>
            <UserMenu user={{ name: userName, email: userEmail }} onLogout={handleLogout} />
          </Header.Actions>
        </Header>
      </AppShell.Navbar>

      <AppShell.Sidebar>
        <Sidebar
          collapsed={collapsed}
          activeItem={activeSidebarItem}
          onSelect={(id) => {
            if (id === 'overview') {
              navigate(inIntegrationLevel ? integrationPath : inProjectLevel ? projectPath : orgPath);
              return;
            }
            if (id === 'build' && hasIntegrationRouteParams) {
              navigate(integrationBuildRoute);
              return;
            }
            if (id === 'deploy' && hasIntegrationRouteParams) {
              navigate(integrationDeployRoute);
            }
          }}
        >
          <Sidebar.Nav>
            <Sidebar.Category>
              <Sidebar.Item id="overview">
                <Sidebar.ItemIcon>
                  <LayoutDashboard size={20} />
                </Sidebar.ItemIcon>
                <Sidebar.ItemLabel>Overview</Sidebar.ItemLabel>
              </Sidebar.Item>
            </Sidebar.Category>

            <Sidebar.Category>
              <Sidebar.Item id="develop">
                <Sidebar.ItemIcon>
                  <Wrench size={20} />
                </Sidebar.ItemIcon>
                <Sidebar.ItemLabel>Develop</Sidebar.ItemLabel>
              </Sidebar.Item>
              {hasIntegrationRouteParams && (
                <Sidebar.Item id="build">
                  <Sidebar.ItemIcon>
                    <Workflow size={20} />
                  </Sidebar.ItemIcon>
                  <Sidebar.ItemLabel>Build</Sidebar.ItemLabel>
                </Sidebar.Item>
              )}
              {hasIntegrationRouteParams && (
                <Sidebar.Item id="deploy">
                  <Sidebar.ItemIcon>
                    <Rocket size={20} />
                  </Sidebar.ItemIcon>
                  <Sidebar.ItemLabel>Deploy</Sidebar.ItemLabel>
                </Sidebar.Item>
              )}
              <Sidebar.Item id="test">
                <Sidebar.ItemIcon>
                  <FlaskConical size={20} />
                </Sidebar.ItemIcon>
                <Sidebar.ItemLabel>Test</Sidebar.ItemLabel>
              </Sidebar.Item>
              <Sidebar.Item id="insights">
                <Sidebar.ItemIcon>
                  <BarChart3 size={20} />
                </Sidebar.ItemIcon>
                <Sidebar.ItemLabel>Insights</Sidebar.ItemLabel>
              </Sidebar.Item>
            </Sidebar.Category>

            <Sidebar.Category>
              <Sidebar.Item id="observability">
                <Sidebar.ItemIcon>
                  <ScrollText size={20} />
                </Sidebar.ItemIcon>
                <Sidebar.ItemLabel>Observability</Sidebar.ItemLabel>
              </Sidebar.Item>
              <Sidebar.Item id="admin">
                <Sidebar.ItemIcon>
                  <Settings size={20} />
                </Sidebar.ItemIcon>
                <Sidebar.ItemLabel>Admin</Sidebar.ItemLabel>
              </Sidebar.Item>
            </Sidebar.Category>
          </Sidebar.Nav>

          <Sidebar.Footer>
            <Sidebar.Category>
              <Button
                variant="text"
                fullWidth
                onClick={() => setCollapsed((prev) => !prev)}
                sx={{ minHeight: 'auto', py: 1, justifyContent: 'flex-start' }}
              >
                <Sidebar.Item id="expand">
                  <Sidebar.ItemIcon>
                    <ChevronRight size={20} style={{ transform: collapsed ? 'none' : 'rotate(180deg)' }} />
                  </Sidebar.ItemIcon>
                  <Sidebar.ItemLabel>{collapsed ? 'Expand' : 'Collapse'}</Sidebar.ItemLabel>
                </Sidebar.Item>
              </Button>
            </Sidebar.Category>
          </Sidebar.Footer>
        </Sidebar>
      </AppShell.Sidebar>

      <AppShell.Main>
        <Box sx={{ p: 3, width: '100%' }}>
          <Outlet />
        </Box>
      </AppShell.Main>

      <AppShell.Footer>
        <Footer
          copyright="© 2026 WSO2 LLC. All rights reserved."
          termsUrl="#terms"
          privacyUrl="#privacy"
        />
      </AppShell.Footer>
    </AppShell>
  );
}

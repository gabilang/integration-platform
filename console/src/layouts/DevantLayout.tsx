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
  Menu,
  MenuItem,
  Sidebar,
  Stack,
  UserMenu,
  useTheme,
} from '@wso2/oxygen-ui';
import {
  BarChart3,
  Building,
  ChevronRight,
  ChevronRightCircle,
  Compass,
  FlaskConical,
  LayoutDashboard,
  Plus,
  Rocket,
  ScrollText,
  Settings,
  Shield,
  Workflow,
  Wrench,
  X,
} from '@wso2/oxygen-ui-icons-react';
import { useAsgardeo } from '../auth';
import { useUserClaims } from '../auth/useUserClaims';
import { env } from '../config/env';
import { getDefaultOrganizationId, getOrganizations } from '../data/mockData';
import { useProjects } from '../services/api/namespaces/projects/hooks';
import { useComponents } from '../services/api/namespaces/components/hooks';
import {
  integrationBuildPath,
  integrationDeployPath,
  integrationOverviewPath,
  organizationOverviewPath,
  projectCreatePath,
  projectOverviewPath,
} from '../lib/paths';

function normalizeClaimValue(value: string): string {
  return value.trim().toLowerCase();
}

export default function DevantLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { signOut } = useAsgardeo();
  const { claims } = useUserClaims();
  const { orgId, projectId, integrationId } = useParams();

  const [collapsed, setCollapsed] = useState(false);
  const [projectAnchorEl, setProjectAnchorEl] = useState<null | HTMLElement>(null);
  const [integrationAnchorEl, setIntegrationAnchorEl] = useState<null | HTMLElement>(null);
  const projectMenuOpen = Boolean(projectAnchorEl);
  const integrationMenuOpen = Boolean(integrationAnchorEl);

  // Organizations come from the runtime store (populated in App.tsx from real API + JWT claims).
  const organizations = getOrganizations();

  const selectedOrg = useMemo(() => {
    const fallback = organizations[0];
    if (!fallback) return undefined;
    if (!orgId) return getOrganizations().find(o => o.id === getDefaultOrganizationId()) ?? fallback;
    return organizations.find(o => o.id === orgId) ?? fallback;
  }, [orgId, organizations]);

  // Real API hooks for projects and components.
  const { projects } = useProjects(selectedOrg?.id);
  const { components } = useComponents(selectedOrg?.id, projectId);

  const selectedProject = useMemo(() => {
    return projects.find(p => p.name === projectId);
  }, [projects, projectId]);

  const selectedIntegration = useMemo(() => {
    return components.find(c => c.name === integrationId);
  }, [components, integrationId]);

  if (!selectedOrg) {
    return null;
  }

  const routeOrgId = orgId ?? selectedOrg.id;
  const routeProjectId = projectId ?? '';
  const routeIntegrationId = integrationId ?? '';
  const hasIntegrationRouteParams = Boolean(orgId && projectId && integrationId);
  const inProjectLevel = Boolean(projectId);
  const inIntegrationLevel = Boolean(projectId && integrationId);

  const orgPath = organizationOverviewPath(routeOrgId);
  const projectPath = routeProjectId ? projectOverviewPath(routeOrgId, routeProjectId) : orgPath;
  const integrationPath = hasIntegrationRouteParams
    ? integrationOverviewPath(routeOrgId, routeProjectId, routeIntegrationId)
    : projectPath;
  const integrationBuildRoute = hasIntegrationRouteParams
    ? integrationBuildPath(routeOrgId, routeProjectId, routeIntegrationId)
    : integrationPath;
  const integrationDeployRoute = hasIntegrationRouteParams
    ? integrationDeployPath(routeOrgId, routeProjectId, routeIntegrationId)
    : integrationPath;

  const activeSidebarItem = (() => {
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
  })();

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

  const renderOrgValue = (label: string, icon: ReactNode) => (
    <>
      <ComplexSelect.MenuItem.Icon>{icon}</ComplexSelect.MenuItem.Icon>
      <ComplexSelect.MenuItem.Text primary={label} />
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
              {/* Organization selector — always shown */}
              <ComplexSelect
                value={selectedOrg.id}
                onChange={(event) => navigate(organizationOverviewPath(String(event.target.value)))}
                size="small"
                sx={{ minWidth: 220 }}
                renderValue={() => renderOrgValue(selectedOrganizationLabel, <Building size={16} />)}
                label="Organizations"
              >
                {organizations.map((organization) => (
                  <ComplexSelect.MenuItem key={organization.id} value={organization.id}>
                    <ComplexSelect.MenuItem.Icon>
                      <Building size={16} />
                    </ComplexSelect.MenuItem.Icon>
                    <ComplexSelect.MenuItem.Text
                      primary={
                        tokenOrganizationLabel && doesOrganizationMatchToken(organization)
                          ? tokenOrganizationLabel
                          : organization.name
                      }
                    />
                  </ComplexSelect.MenuItem>
                ))}
              </ComplexSelect>

              {/* Project selector */}
              {selectedProject ? (
                <Box position="relative">
                  <ComplexSelect
                    value={projectId}
                    onChange={(event) =>
                      navigate(projectOverviewPath(routeOrgId, String(event.target.value)))
                    }
                    size="small"
                    sx={{ minWidth: 190 }}
                    renderValue={() => (
                      <>
                        <ComplexSelect.MenuItem.Icon>
                          <Compass size={16} />
                        </ComplexSelect.MenuItem.Icon>
                        <ComplexSelect.MenuItem.Text primary={selectedProject.displayName || selectedProject.name} />
                      </>
                    )}
                    label="Projects"
                  >
                    <ComplexSelect.MenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(projectCreatePath(routeOrgId));
                      }}
                    >
                      <ComplexSelect.MenuItem.Icon>
                        <Plus size={16} />
                      </ComplexSelect.MenuItem.Icon>
                      <ComplexSelect.MenuItem.Text primary="Create a Project" />
                    </ComplexSelect.MenuItem>
                    {projects.map((project) => (
                      <ComplexSelect.MenuItem key={project.name} value={project.name}>
                        <ComplexSelect.MenuItem.Icon>
                          <Compass size={16} />
                        </ComplexSelect.MenuItem.Icon>
                        <ComplexSelect.MenuItem.Text
                          primary={project.displayName || project.name}
                          secondary={project.description}
                        />
                      </ComplexSelect.MenuItem>
                    ))}
                  </ComplexSelect>
                  <Box position="absolute" right={0} top={-2}>
                    <IconButton
                      size="small"
                      sx={{ color: theme.vars?.palette.text.disabled }}
                      onClick={() => navigate(orgPath)}
                    >
                      <X size={12} />
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                <>
                  <IconButton
                    onClick={(e) => setProjectAnchorEl(e.currentTarget)}
                    size="small"
                    sx={{
                      transform: projectMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  >
                    <ChevronRightCircle size={20} />
                  </IconButton>
                  <Menu
                    anchorEl={projectAnchorEl}
                    open={projectMenuOpen}
                    onClose={() => setProjectAnchorEl(null)}
                  >
                    <MenuItem
                      onClick={() => {
                        setProjectAnchorEl(null);
                        navigate(projectCreatePath(routeOrgId));
                      }}
                    >
                      <Plus size={16} style={{ marginRight: 8 }} />
                      Create a Project
                    </MenuItem>
                    {projects.map((project) => (
                      <MenuItem
                        key={project.name}
                        onClick={() => {
                          setProjectAnchorEl(null);
                          navigate(projectOverviewPath(routeOrgId, project.name));
                        }}
                      >
                        <Compass size={16} style={{ marginRight: 8 }} />
                        {project.displayName || project.name}
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}

              {/* Integration selector — shown once a project is selected */}
              {inProjectLevel && (
                <>
                  {selectedIntegration ? (
                    <Box position="relative">
                      <ComplexSelect
                        value={integrationId}
                        onChange={(event) =>
                          navigate(
                            integrationOverviewPath(routeOrgId, routeProjectId, String(event.target.value))
                          )
                        }
                        size="small"
                        sx={{ minWidth: 190 }}
                        renderValue={() => (
                          <>
                            <ComplexSelect.MenuItem.Icon>
                              <Workflow size={16} />
                            </ComplexSelect.MenuItem.Icon>
                            <ComplexSelect.MenuItem.Text
                              primary={selectedIntegration.displayName || selectedIntegration.name}
                            />
                          </>
                        )}
                        label="Integrations"
                      >
                        {components.map((component) => (
                          <ComplexSelect.MenuItem key={component.name} value={component.name}>
                            <ComplexSelect.MenuItem.Icon>
                              <Workflow size={16} />
                            </ComplexSelect.MenuItem.Icon>
                            <ComplexSelect.MenuItem.Text
                              primary={component.displayName || component.name}
                              secondary={component.type}
                            />
                          </ComplexSelect.MenuItem>
                        ))}
                      </ComplexSelect>
                      <Box position="absolute" right={0} top={-2}>
                        <IconButton
                          size="small"
                          sx={{ color: theme.vars?.palette.text.disabled }}
                          onClick={() => navigate(projectPath)}
                        >
                          <X size={12} />
                        </IconButton>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      <IconButton
                        onClick={(e) => setIntegrationAnchorEl(e.currentTarget)}
                        size="small"
                        sx={{
                          transform: integrationMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                        }}
                      >
                        <ChevronRightCircle size={20} />
                      </IconButton>
                      <Menu
                        anchorEl={integrationAnchorEl}
                        open={integrationMenuOpen}
                        onClose={() => setIntegrationAnchorEl(null)}
                      >
                        {components.length === 0 && (
                          <MenuItem disabled>No integrations yet</MenuItem>
                        )}
                        {components.map((component) => (
                          <MenuItem
                            key={component.name}
                            onClick={() => {
                              setIntegrationAnchorEl(null);
                              navigate(integrationOverviewPath(routeOrgId, routeProjectId, component.name));
                            }}
                          >
                            <Workflow size={16} style={{ marginRight: 8 }} />
                            {component.displayName || component.name}
                          </MenuItem>
                        ))}
                      </Menu>
                    </>
                  )}
                </>
              )}
            </Stack>
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

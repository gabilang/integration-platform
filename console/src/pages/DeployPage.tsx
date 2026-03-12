import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Drawer,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  PageContent,
  PageTitle,
  Select,
  Stack,
  TextField,
  Typography,
} from '@wso2/oxygen-ui';
import { Check, Clock, Edit, ExternalLink, GitCommit, Package, Rocket } from '@wso2/oxygen-ui-icons-react';
import {
  type IntegrationBuild,
  type IntegrationDeployment,
  deployIntegrationBuild,
  getIntegrationBuilds,
  getIntegrationDeployments,
  isBuildDeployable,
} from '../data/integrationRuntime';
import { getIntegration } from '../data/mockData';
import { integrationBuildPath } from '../lib/paths';
import { formatDistanceToNow } from '../lib/time';

function deploymentStatusColor(status: IntegrationDeployment['status']): string {
  switch (status) {
    case 'active':
      return 'success.main';
    case 'deploying':
      return 'warning.main';
    case 'failed':
      return 'error.main';
    default:
      return 'text.secondary';
  }
}

function formatBuildDate(value: string): string {
  return new Date(value).toLocaleString();
}

export default function DeployPage() {
  const { orgId = '', projectId = '', integrationId = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const integration = getIntegration(orgId, projectId, integrationId);

  const [builds, setBuilds] = useState<IntegrationBuild[]>(() => getIntegrationBuilds(orgId, projectId, integrationId));
  const [deployments, setDeployments] = useState<IntegrationDeployment[]>(() =>
    getIntegrationDeployments(orgId, projectId, integrationId)
  );
  const [targetEnvironmentId, setTargetEnvironmentId] = useState('development');
  const [tempSelectedBuild, setTempSelectedBuild] = useState('');
  const environmentOptions = useMemo(
    () =>
      integration?.environments.length
        ? integration.environments.map((environment) => ({ id: environment.id, name: environment.name }))
        : [{ id: 'development', name: 'Development' }],
    [integration?.environments]
  );

  useEffect(() => {
    setBuilds(getIntegrationBuilds(orgId, projectId, integrationId));
    setDeployments(getIntegrationDeployments(orgId, projectId, integrationId));
  }, [orgId, projectId, integrationId]);

  useEffect(() => {
    setTargetEnvironmentId(environmentOptions[0]?.id ?? 'development');
  }, [environmentOptions]);

  const orderedBuilds = useMemo(
    () => [...builds].sort((left, right) => new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime()),
    [builds]
  );
  const deployableBuilds = useMemo(() => orderedBuilds.filter((build) => isBuildDeployable(build.status)), [orderedBuilds]);
  const selectedBuildFromParams = searchParams.get('selectedBuild');
  const selectedBuild =
    deployableBuilds.find((build) => build.buildName === selectedBuildFromParams) ?? deployableBuilds[0] ?? undefined;
  const isBuildSelectorOpen = searchParams.get('buildSelector') === 'open';
  const isDeployPanelOpen = searchParams.get('deployPanel') === 'open';

  useEffect(() => {
    if (selectedBuildFromParams || !deployableBuilds.length) {
      return;
    }
    const next = new URLSearchParams(searchParams);
    next.set('selectedBuild', deployableBuilds[0].buildName);
    setSearchParams(next, { replace: true });
  }, [deployableBuilds, searchParams, selectedBuildFromParams, setSearchParams]);

  useEffect(() => {
    if (isBuildSelectorOpen) {
      setTempSelectedBuild(selectedBuild?.buildName ?? '');
    }
  }, [isBuildSelectorOpen, selectedBuild]);

  const openBuildSelector = () => {
    const next = new URLSearchParams(searchParams);
    next.set('buildSelector', 'open');
    setSearchParams(next);
  };

  const closeBuildSelector = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('buildSelector');
    setSearchParams(next);
  };

  const confirmBuildSelection = () => {
    const next = new URLSearchParams(searchParams);
    if (tempSelectedBuild) {
      next.set('selectedBuild', tempSelectedBuild);
    }
    next.delete('buildSelector');
    setSearchParams(next);
  };

  const openDeployDrawer = () => {
    const next = new URLSearchParams(searchParams);
    next.set('deployPanel', 'open');
    setSearchParams(next);
  };

  const closeDeployDrawer = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('deployPanel');
    setSearchParams(next);
  };

  const handleDeploy = () => {
    if (!selectedBuild || !targetEnvironmentId) {
      return;
    }

    setDeployments(deployIntegrationBuild(orgId, projectId, integrationId, targetEnvironmentId, selectedBuild.buildName));
    setBuilds(getIntegrationBuilds(orgId, projectId, integrationId));
    closeDeployDrawer();
  };

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Deploy</PageTitle.Header>
        <PageTitle.SubHeader>Select a successful build and deploy it to an environment.</PageTitle.SubHeader>
      </PageTitle>

      <Stack direction="row" gap={3} sx={{ overflowX: 'auto', pb: 2 }}>
        <Card variant="outlined" sx={{ width: 360, minWidth: 360, height: 'fit-content' }}>
          <CardContent>
            <Stack gap={2}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Set up
              </Typography>
              <Divider />
              {selectedBuild ? (
                <>
                  <Typography variant="body2" color="text.secondary">
                    Select Build
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={openBuildSelector}
                    sx={{ justifyContent: 'space-between', textTransform: 'none' }}
                  >
                    <Stack gap={0.5} alignItems="flex-start">
                      <Typography variant="body1">{selectedBuild.buildName}</Typography>
                      <Stack direction="row" gap={1.5}>
                        <Stack direction="row" gap={0.5} alignItems="center">
                          <GitCommit size={14} />
                          <Typography variant="caption">{selectedBuild.commitId.slice(0, 8)}</Typography>
                        </Stack>
                        <Stack direction="row" gap={0.5} alignItems="center">
                          <Clock size={14} />
                          <Typography variant="caption">{new Date(selectedBuild.startedAt).toLocaleDateString()}</Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                    <Edit size={16} />
                  </Button>
                  <Divider />
                  <Button variant="contained" startIcon={<Rocket size={16} />} fullWidth onClick={openDeployDrawer}>
                    Configure & Deploy
                  </Button>
                </>
              ) : (
                <Stack gap={1.5} alignItems="center" sx={{ py: 3 }}>
                  <Rocket size={32} />
                  <Typography variant="body2" color="text.secondary">
                    No completed builds available.
                  </Typography>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>

        {environmentOptions.map((environment) => {
          const deployment = deployments.find((item) => item.environmentId === environment.id);

          return (
            <Card key={environment.id} variant="outlined" sx={{ width: 360, minWidth: 360, height: 'fit-content' }}>
              <CardContent>
                <Stack gap={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {environment.name} Environment
                    </Typography>
                    <Typography variant="caption" sx={{ color: deploymentStatusColor(deployment?.status ?? 'not-deployed') }}>
                      {deployment?.status ?? 'not-deployed'}
                    </Typography>
                  </Stack>
                  <Divider />

                  {!deployment || deployment.status === 'not-deployed' ? (
                    <Typography variant="body2" color="text.secondary">
                      No deployment found for this environment.
                    </Typography>
                  ) : (
                    <>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Typography variant="body2">Last Deployed</Typography>
                        <Clock size={14} />
                        <Typography variant="body2">
                          {deployment.lastDeployed ? formatDistanceToNow(deployment.lastDeployed) : 'Unknown'}
                        </Typography>
                      </Stack>

                      <TextField
                        label="Build Image"
                        fullWidth
                        value={deployment.imageId ?? ''}
                        slotProps={{
                          input: {
                            readOnly: true,
                          },
                        }}
                      />

                      {deployment.endpoints.map((endpoint) => (
                        <TextField
                          key={endpoint}
                          label="URL"
                          fullWidth
                          value={endpoint}
                          slotProps={{
                            input: {
                              readOnly: true,
                            },
                          }}
                        />
                      ))}

                      <Stack direction="row" gap={1}>
                        <Button
                          variant="outlined"
                          fullWidth
                          component="a"
                          href={deployment.endpoints[0] ?? '#'}
                          target="_blank"
                          rel="noreferrer"
                          startIcon={<ExternalLink size={14} />}
                          disabled={!deployment.endpoints.length}
                        >
                          Try It
                        </Button>
                        <Button
                          variant="text"
                          fullWidth
                          component={Link}
                          to={`${integrationBuildPath(orgId, projectId, integrationId)}?panel=logs&selectedBuild=${deployment.buildName ?? ''}`}
                          disabled={!deployment.buildName}
                        >
                          View Logs
                        </Button>
                      </Stack>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      <Drawer anchor="right" open={isBuildSelectorOpen} onClose={closeBuildSelector}>
        <Box sx={{ width: { xs: '100vw', sm: 520 }, height: '100%', p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Package size={20} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Select Build
              </Typography>
            </Stack>
            <Button variant="text" onClick={closeBuildSelector}>
              Close
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose a completed build to deploy.
          </Typography>

          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {deployableBuilds.map((build) => {
              const selected = tempSelectedBuild === build.buildName;
              return (
                <ListItem key={build.buildName} disablePadding sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <ListItemButton selected={selected} onClick={() => setTempSelectedBuild(build.buildName)}>
                    <ListItemText
                      primary={build.buildName}
                      secondary={
                        <Stack direction="row" gap={2}>
                          <Stack direction="row" gap={0.5} alignItems="center">
                            <GitCommit size={12} />
                            <Typography variant="caption">{build.commitId.slice(0, 12)}</Typography>
                          </Stack>
                          <Stack direction="row" gap={0.5} alignItems="center">
                            <Clock size={12} />
                            <Typography variant="caption">{formatBuildDate(build.startedAt)}</Typography>
                          </Stack>
                        </Stack>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          <Stack direction="row" justifyContent="flex-end" gap={1} sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={closeBuildSelector}>
              Cancel
            </Button>
            <Button variant="contained" startIcon={<Check size={14} />} onClick={confirmBuildSelection} disabled={!tempSelectedBuild}>
              Select
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <Drawer anchor="right" open={isDeployPanelOpen} onClose={closeDeployDrawer}>
        <Box sx={{ width: { xs: '100vw', sm: 520 }, height: '100%', p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Configure Deployment
            </Typography>
            <Button variant="text" onClick={closeDeployDrawer}>
              Close
            </Button>
          </Stack>

          <Stack gap={2}>
            <TextField
              label="Selected Build"
              value={selectedBuild?.buildName ?? ''}
              fullWidth
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel id="deploy-environment-label">Environment</InputLabel>
              <Select
                labelId="deploy-environment-label"
                label="Environment"
                value={targetEnvironmentId}
                onChange={(event) => setTargetEnvironmentId(String(event.target.value))}
              >
                {environmentOptions.map((environment) => (
                  <MenuItem key={environment.id} value={environment.id}>
                    {environment.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" justifyContent="flex-end" gap={1}>
              <Button variant="outlined" onClick={closeDeployDrawer}>
                Cancel
              </Button>
              <Button variant="contained" startIcon={<Rocket size={14} />} disabled={!selectedBuild} onClick={handleDeploy}>
                Deploy
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>
    </PageContent>
  );
}

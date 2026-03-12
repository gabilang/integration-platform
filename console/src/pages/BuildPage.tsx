import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  Grid,
  ListingTable,
  PageContent,
  PageTitle,
  Stack,
  StatCard,
  TextField,
  Typography,
} from '@wso2/oxygen-ui';
import { CheckCircle, Circle, GitCommit, Rocket, Settings, Wrench, XCircle } from '@wso2/oxygen-ui-icons-react';
import {
  type IntegrationBuild,
  type IntegrationBuildStatus,
  getIntegrationBuilds,
  isBuildDeployable,
  triggerIntegrationBuild,
} from '../data/integrationRuntime';
import { getIntegration } from '../data/mockData';
import { integrationDeployPath } from '../lib/paths';

type BuildConfig = {
  repositoryUrl: string;
  branch: string;
  appPath: string;
  language: string;
  languageVersion: string;
  runCommand: string;
};

function formatBuildDate(value: string): string {
  return new Date(value).toLocaleString();
}

function statusColor(status: IntegrationBuildStatus): 'success' | 'warning' | 'error' | 'default' {
  switch (status) {
    case 'Succeeded':
    case 'Completed':
      return 'success';
    case 'Failed':
      return 'error';
    case 'Running':
    case 'Pending':
      return 'warning';
    default:
      return 'default';
  }
}

function statusIconColor(status: IntegrationBuildStatus | undefined): 'success' | 'warning' | 'error' | 'info' {
  if (!status) {
    return 'info';
  }
  if (status === 'Succeeded' || status === 'Completed') {
    return 'success';
  }
  if (status === 'Failed') {
    return 'error';
  }
  if (status === 'Running' || status === 'Pending') {
    return 'warning';
  }
  return 'info';
}

function statusIcon(status: IntegrationBuildStatus) {
  if (status === 'Running' || status === 'Pending') {
    return <CircularProgress size={14} color="warning" />;
  }
  if (status === 'Failed') {
    return <XCircle size={14} />;
  }
  if (status === 'Succeeded' || status === 'Completed') {
    return <CheckCircle size={14} />;
  }
  return <Circle size={14} />;
}

function BuildStatusChip({ status }: { status: IntegrationBuildStatus }) {
  return <Chip variant="outlined" color={statusColor(status)} icon={statusIcon(status)} label={status} size="small" />;
}

function defaultBuildConfig(repositoryUrl: string): BuildConfig {
  return {
    repositoryUrl,
    branch: 'main',
    appPath: '/',
    language: 'python',
    languageVersion: '3.11',
    runCommand: 'python main.py',
  };
}

export default function BuildPage() {
  const { orgId = '', projectId = '', integrationId = '' } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const integration = getIntegration(orgId, projectId, integrationId);

  const [builds, setBuilds] = useState<IntegrationBuild[]>(() => getIntegrationBuilds(orgId, projectId, integrationId));
  const [config, setConfig] = useState<BuildConfig>(() => defaultBuildConfig(integration?.repository ?? ''));

  useEffect(() => {
    setBuilds(getIntegrationBuilds(orgId, projectId, integrationId));
  }, [orgId, projectId, integrationId]);

  useEffect(() => {
    setConfig(defaultBuildConfig(integration?.repository ?? ''));
  }, [integration?.repository]);

  const selectedBuildName = searchParams.get('selectedBuild');
  const selectedPanel = searchParams.get('panel');
  const selectedBuild = selectedBuildName ? builds.find((build) => build.buildName === selectedBuildName) : undefined;
  const isLogsOpen = Boolean(selectedBuildName && selectedPanel === 'logs');
  const isConfigureBuildOpen = searchParams.get('configureBuild') === 'open';

  const successfulBuildCount = useMemo(
    () => builds.filter((build) => build.status === 'Succeeded' || build.status === 'Completed').length,
    [builds]
  );
  const failedBuildCount = useMemo(() => builds.filter((build) => build.status === 'Failed').length, [builds]);
  const latestBuild = builds[0];
  const successRate = successfulBuildCount / Math.max(1, successfulBuildCount + failedBuildCount);

  const openLogsPanel = (buildName: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('selectedBuild', buildName);
    next.set('panel', 'logs');
    setSearchParams(next);
  };

  const closeLogsPanel = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('selectedBuild');
    next.delete('panel');
    setSearchParams(next);
  };

  const openConfigureBuild = () => {
    const next = new URLSearchParams(searchParams);
    next.set('configureBuild', 'open');
    setSearchParams(next);
  };

  const closeConfigureBuild = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('configureBuild');
    setSearchParams(next);
  };

  const handleTriggerBuild = () => {
    setBuilds(triggerIntegrationBuild(orgId, projectId, integrationId, config.branch));
  };

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Build</PageTitle.Header>
        <PageTitle.SubHeader>Trigger builds and track execution history for this integration.</PageTitle.SubHeader>
      </PageTitle>

      <Stack direction="row" justifyContent="flex-end" gap={1.5} sx={{ mb: 3 }}>
        <Button variant="outlined" startIcon={<Settings size={16} />} onClick={openConfigureBuild}>
          Configure Build
        </Button>
        <Button variant="contained" startIcon={<Wrench size={16} />} onClick={handleTriggerBuild}>
          Trigger a Build
        </Button>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            label="Latest Build Status"
            value={latestBuild?.status ?? 'No builds'}
            icon={statusIcon(latestBuild?.status ?? 'Failed')}
            iconColor={statusIconColor(latestBuild?.status)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            label="Build Success Rate"
            value={`${(successRate * 100).toFixed(1)}%`}
            icon={<CheckCircle size={20} />}
            iconColor={successRate >= 0.9 ? 'success' : successRate >= 0.5 ? 'warning' : 'error'}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Total Builds" value={String(builds.length)} icon={<Rocket size={20} />} iconColor="primary" />
        </Grid>
      </Grid>

      <ListingTable.Container disablePaper>
        {builds.length === 0 ? (
          <ListingTable.EmptyState
            illustration={<Rocket size={64} />}
            title="No builds yet"
            description="Trigger a build to see it listed here."
          />
        ) : (
          <ListingTable density="compact">
            <ListingTable.Head>
              <ListingTable.Row>
                <ListingTable.Cell width="22%">Branch</ListingTable.Cell>
                <ListingTable.Cell width="24%">Build Name</ListingTable.Cell>
                <ListingTable.Cell width="22%">Started At</ListingTable.Cell>
                <ListingTable.Cell width="12%">Status</ListingTable.Cell>
                <ListingTable.Cell width="20%" align="right">
                  Actions
                </ListingTable.Cell>
              </ListingTable.Row>
            </ListingTable.Head>
            <ListingTable.Body>
              {builds.map((build) => (
                <ListingTable.Row key={build.buildName}>
                  <ListingTable.Cell>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <GitCommit size={14} />
                      <Typography variant="body2" noWrap>
                        {`${build.branch}: ${build.commitId.slice(0, 8)}`}
                      </Typography>
                    </Stack>
                  </ListingTable.Cell>
                  <ListingTable.Cell>
                    <Typography variant="body2" noWrap>
                      {build.buildName}
                    </Typography>
                  </ListingTable.Cell>
                  <ListingTable.Cell>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {formatBuildDate(build.startedAt)}
                    </Typography>
                  </ListingTable.Cell>
                  <ListingTable.Cell>
                    <BuildStatusChip status={build.status} />
                  </ListingTable.Cell>
                  <ListingTable.Cell align="right">
                    <Stack direction="row" gap={1} justifyContent="flex-end">
                      <Button variant="text" size="small" onClick={() => openLogsPanel(build.buildName)}>
                        Details
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={!isBuildDeployable(build.status)}
                        onClick={() =>
                          navigate(`${integrationDeployPath(orgId, projectId, integrationId)}?selectedBuild=${build.buildName}`)
                        }
                      >
                        Deploy
                      </Button>
                    </Stack>
                  </ListingTable.Cell>
                </ListingTable.Row>
              ))}
            </ListingTable.Body>
          </ListingTable>
        )}
      </ListingTable.Container>

      <Drawer anchor="right" open={isLogsOpen} onClose={closeLogsPanel}>
        <Box sx={{ width: { xs: '100vw', sm: 560 }, height: '100%', p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Build Logs
            </Typography>
            <Button variant="text" onClick={closeLogsPanel}>
              Close
            </Button>
          </Stack>
          {selectedBuild ? (
            <Stack gap={2}>
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {selectedBuild.buildName}
                    </Typography>
                    <BuildStatusChip status={selectedBuild.status} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Started at {formatBuildDate(selectedBuild.startedAt)}
                  </Typography>
                </CardContent>
              </Card>
              <Divider />
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflowX: 'auto',
                }}
              >
                <Typography component="span" variant="body2">
                  {selectedBuild.logs.join('\n')}
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Build log not found.
            </Typography>
          )}
        </Box>
      </Drawer>

      <Drawer anchor="right" open={isConfigureBuildOpen} onClose={closeConfigureBuild}>
        <Box sx={{ width: { xs: '100vw', sm: 540 }, height: '100%', p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Configure Build
            </Typography>
            <Button variant="text" onClick={closeConfigureBuild}>
              Close
            </Button>
          </Stack>

          <Stack gap={2}>
            <TextField
              label="Repository URL"
              fullWidth
              value={config.repositoryUrl}
              onChange={(event) => setConfig((previous) => ({ ...previous, repositoryUrl: event.target.value }))}
            />
            <Stack direction="row" gap={2}>
              <TextField
                label="Branch"
                fullWidth
                value={config.branch}
                onChange={(event) => setConfig((previous) => ({ ...previous, branch: event.target.value }))}
              />
              <TextField
                label="App Path"
                fullWidth
                value={config.appPath}
                onChange={(event) => setConfig((previous) => ({ ...previous, appPath: event.target.value }))}
              />
            </Stack>
            <Stack direction="row" gap={2}>
              <TextField
                label="Language"
                fullWidth
                value={config.language}
                onChange={(event) => setConfig((previous) => ({ ...previous, language: event.target.value }))}
              />
              <TextField
                label="Language Version"
                fullWidth
                value={config.languageVersion}
                onChange={(event) => setConfig((previous) => ({ ...previous, languageVersion: event.target.value }))}
              />
            </Stack>
            <TextField
              label="Run Command"
              fullWidth
              value={config.runCommand}
              onChange={(event) => setConfig((previous) => ({ ...previous, runCommand: event.target.value }))}
            />
            <Stack direction="row" justifyContent="flex-end" gap={1}>
              <Button variant="outlined" onClick={closeConfigureBuild}>
                Cancel
              </Button>
              <Button variant="contained" onClick={closeConfigureBuild}>
                Save
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>
    </PageContent>
  );
}

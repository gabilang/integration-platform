import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  ListingTable,
  PageContent,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@wso2/oxygen-ui';
import { RefreshCw } from '@wso2/oxygen-ui-icons-react';
import NotFoundView from '../components/NotFoundView';
import { getIntegration } from '../data/mockData';
import { projectOverviewPath } from '../lib/paths';
import { formatDistanceToNow } from '../lib/time';

function RuntimesTable({
  runtimes,
}: {
  runtimes: { id: string; type: string; status: string; version: string; updatedAt: string }[];
}) {
  if (!runtimes.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
        No runtimes available for this environment.
      </Typography>
    );
  }

  return (
    <ListingTable.Container disablePaper>
      <ListingTable density="compact">
        <ListingTable.Head>
          <ListingTable.Row>
            <ListingTable.Cell>Runtime ID</ListingTable.Cell>
            <ListingTable.Cell>Type</ListingTable.Cell>
            <ListingTable.Cell>Status</ListingTable.Cell>
            <ListingTable.Cell>Version</ListingTable.Cell>
            <ListingTable.Cell>Last Updated</ListingTable.Cell>
          </ListingTable.Row>
        </ListingTable.Head>
        <ListingTable.Body>
          {runtimes.map((runtime) => (
            <ListingTable.Row key={runtime.id}>
              <ListingTable.Cell>{runtime.id}</ListingTable.Cell>
              <ListingTable.Cell>{runtime.type}</ListingTable.Cell>
              <ListingTable.Cell>
                <Chip
                  label={runtime.status}
                  size="small"
                  color={runtime.status === 'Running' ? 'success' : runtime.status === 'Starting' ? 'warning' : 'default'}
                />
              </ListingTable.Cell>
              <ListingTable.Cell>{runtime.version}</ListingTable.Cell>
              <ListingTable.Cell>{formatDistanceToNow(runtime.updatedAt)}</ListingTable.Cell>
            </ListingTable.Row>
          ))}
        </ListingTable.Body>
      </ListingTable>
    </ListingTable.Container>
  );
}

function ArtifactsTable({
  artifacts,
}: {
  artifacts: { id: string; name: string; type: string; version: string; state: string }[];
}) {
  if (!artifacts.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
        No artifacts available for this environment.
      </Typography>
    );
  }

  return (
    <ListingTable.Container disablePaper>
      <ListingTable density="compact">
        <ListingTable.Head>
          <ListingTable.Row>
            <ListingTable.Cell>Name</ListingTable.Cell>
            <ListingTable.Cell>Type</ListingTable.Cell>
            <ListingTable.Cell>Version</ListingTable.Cell>
            <ListingTable.Cell>State</ListingTable.Cell>
          </ListingTable.Row>
        </ListingTable.Head>
        <ListingTable.Body>
          {artifacts.map((artifact) => (
            <ListingTable.Row key={artifact.id}>
              <ListingTable.Cell>{artifact.name}</ListingTable.Cell>
              <ListingTable.Cell>{artifact.type}</ListingTable.Cell>
              <ListingTable.Cell>{artifact.version}</ListingTable.Cell>
              <ListingTable.Cell>
                <Chip label={artifact.state} size="small" variant="outlined" />
              </ListingTable.Cell>
            </ListingTable.Row>
          ))}
        </ListingTable.Body>
      </ListingTable>
    </ListingTable.Container>
  );
}

function EnvironmentCard({
  name,
  runtimes,
  artifacts,
}: {
  name: string;
  runtimes: { id: string; type: string; status: string; version: string; updatedAt: string }[];
  artifacts: { id: string; name: string; type: string; version: string; state: string }[];
}) {
  const [tab, setTab] = useState(0);

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {name}
          </Typography>
          <Stack direction="row" gap={1}>
            <Button variant="text" startIcon={<RefreshCw size={14} />} aria-label={`Refresh ${name} environment`}>
              Refresh
            </Button>
            <Button variant="contained">Configure Runtime</Button>
          </Stack>
        </Stack>
        <Tabs value={tab} onChange={(_, nextTab) => setTab(nextTab)} sx={{ mb: 2 }}>
          <Tab label="Runtimes" />
          <Tab label="Artifacts" />
        </Tabs>
        {tab === 0 ? <RuntimesTable runtimes={runtimes} /> : <ArtifactsTable artifacts={artifacts} />}
      </CardContent>
    </Card>
  );
}

export default function IntegrationOverviewPage() {
  const { orgId = '', projectId = '', integrationId = '' } = useParams();
  const integration = getIntegration(orgId, projectId, integrationId);

  if (!integration) {
    return (
      <NotFoundView
        title="Integration not found"
        description="The requested integration does not exist in the selected project."
        backTo={projectOverviewPath(orgId, projectId)}
        backLabel="Back to project"
      />
    );
  }

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', flex: 1 }}>
      <PageContent>
        <Stack component="header" direction="row" alignItems="center" gap={2} sx={{ mb: 1 }}>
          <Avatar sx={{ width: 56, height: 56, fontSize: 24, bgcolor: 'text.primary', color: 'background.paper' }}>
            {integration.name[0].toUpperCase()}
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {integration.name}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
            <Chip label={integration.type} variant="outlined" />
            <Chip
              label={integration.status}
              color={integration.status === 'Healthy' ? 'success' : integration.status === 'Building' ? 'warning' : 'error'}
            />
          </Stack>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, ml: 9 }}>
          {integration.description || '+ Add Description'}
        </Typography>
        <Typography
          variant="body2"
          component="a"
          href={integration.repository}
          target="_blank"
          rel="noreferrer"
          sx={{ color: 'primary.main', textDecoration: 'none', mb: 4, ml: 9, display: 'inline-block' }}
        >
          {integration.repository}
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            {integration.environments.map((environment) => (
              <EnvironmentCard
                key={environment.id}
                name={environment.name}
                runtimes={environment.runtimes}
                artifacts={environment.artifacts}
              />
            ))}
          </Grid>
        </Grid>
      </PageContent>
    </Box>
  );
}

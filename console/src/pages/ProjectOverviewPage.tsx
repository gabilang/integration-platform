import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  ListingTable,
  PageContent,
  PageTitle,
  SearchBar,
  Skeleton,
  Stack,
  Typography,
} from '@wso2/oxygen-ui';
import { Clock, Package, Plus, PlugZap, RefreshCw } from '@wso2/oxygen-ui-icons-react';
import { formatDistanceToNow } from 'date-fns';
import EmptyListing from '../components/EmptyListing';
import NotFoundView from '../components/NotFoundView';
import { organizationOverviewPath, integrationOverviewPath } from '../lib/paths';
import { components as componentsApi, type Component as ApiComponent } from '../services/api';

function ComponentsTable({
  orgId,
  projectId,
  components,
  isLoading,
  isRefetching,
  error,
  search,
  onSearchChange,
  onRefresh,
}: {
  orgId: string;
  projectId: string;
  components: ApiComponent[];
  isLoading: boolean;
  isRefetching: boolean;
  error: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}) {
  const navigate = useNavigate();

  const filtered = useMemo(
    () =>
      components.filter(
        (c) =>
          !search ||
          (c.displayName ?? c.name).toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase()) ||
          c.type?.toLowerCase().includes(search.toLowerCase()),
      ),
    [components, search],
  );

  return (
    <section>
      <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 2 }}>
        <Box flexGrow={1}>
          <SearchBar
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search Components"
            disabled={isLoading || components.length === 0}
            size="small"
            fullWidth
          />
        </Box>
        <Box display="flex" alignItems="center" minWidth={32} justifyContent="center">
          {isRefetching ? (
            <CircularProgress size={18} color="primary" />
          ) : (
            <IconButton size="small" color="primary" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw size={18} />
            </IconButton>
          )}
        </Box>
        <Button variant="contained" color="primary" size="small" startIcon={<Plus size={16} />}>
          Create
        </Button>
      </Stack>

      {error && (
        <Typography variant="body2" color="error.main" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {isLoading ? (
        <Stack gap={1}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={60} />
          ))}
        </Stack>
      ) : filtered.length === 0 ? (
        <EmptyListing
          icon={<PlugZap size={48} />}
          title="No components found"
          description={search ? 'Try adjusting your search.' : 'Create your first component to get started.'}
        />
      ) : (
        <ListingTable.Container disablePaper>
          <ListingTable variant="card" density="compact">
            <ListingTable.Head>
              <ListingTable.Row>
                <ListingTable.Cell>Name</ListingTable.Cell>
                <ListingTable.Cell>Description</ListingTable.Cell>
                <ListingTable.Cell>Type</ListingTable.Cell>
                <ListingTable.Cell>Created</ListingTable.Cell>
              </ListingTable.Row>
            </ListingTable.Head>
            <ListingTable.Body>
              {filtered.map((component) => (
                <ListingTable.Row
                  key={component.name}
                  variant="card"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(integrationOverviewPath(orgId, projectId, component.name))}
                >
                  <ListingTable.Cell>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'action.hover', color: 'text.primary' }}>
                        {(component.displayName ?? component.name)[0].toUpperCase()}
                      </Avatar>
                      {component.displayName ?? component.name}
                    </Stack>
                  </ListingTable.Cell>
                  <ListingTable.Cell>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 240 }}>
                      {component.description || '—'}
                    </Typography>
                  </ListingTable.Cell>
                  <ListingTable.Cell>
                    <Typography variant="body2">{component.type ?? '—'}</Typography>
                  </ListingTable.Cell>
                  <ListingTable.Cell>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Clock size={14} opacity={0.5} />
                      {component.creationTimestamp
                        ? formatDistanceToNow(new Date(component.creationTimestamp), { addSuffix: true })
                        : '—'}
                    </Typography>
                  </ListingTable.Cell>
                </ListingTable.Row>
              ))}
            </ListingTable.Body>
          </ListingTable>
        </ListingTable.Container>
      )}
    </section>
  );
}

export default function ProjectOverviewPage() {
  const { orgId = '', projectId = '' } = useParams();

  const [components, setComponents] = useState<ApiComponent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadComponents = useCallback(
    async (isRefetch = false) => {
      if (isRefetch) {
        setIsRefetching(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const allItems: ApiComponent[] = [];
        let nextCursor: string | undefined;

        do {
          const response = await componentsApi.listComponents(orgId, {
            projectName: projectId,
            limit: 100,
            cursor: nextCursor,
          });
          allItems.push(...response.items);
          nextCursor = response.pagination?.nextCursor;
        } while (nextCursor);

        setComponents(allItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load components');
      } finally {
        setIsLoading(false);
        setIsRefetching(false);
      }
    },
    [orgId, projectId],
  );

  useEffect(() => {
    void loadComponents();
  }, [loadComponents]);

  if (!orgId || !projectId) {
    return (
      <NotFoundView
        title="Project not found"
        description="The requested project does not exist in the selected organization."
        backTo={organizationOverviewPath(orgId)}
        backLabel="Back to organization"
      />
    );
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>
          <Stack direction="row" alignItems="center" gap={1}>
            <Package size={20} />
            {projectId}
          </Stack>
        </PageTitle.Header>
      </PageTitle>

      <ComponentsTable
        orgId={orgId}
        projectId={projectId}
        components={components}
        isLoading={isLoading}
        isRefetching={isRefetching}
        error={error}
        search={search}
        onSearchChange={setSearch}
        onRefresh={() => void loadComponents(true)}
      />
    </PageContent>
  );
}

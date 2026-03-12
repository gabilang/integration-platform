import { useCallback, useEffect, useMemo, useState } from 'react';
import { generatePath, Link, useParams } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Form,
  IconButton,
  PageContent,
  PageTitle,
  SearchBar,
  Skeleton,
  Stack,
  Typography,
} from '@wso2/oxygen-ui';
import { Clock, Package, Plus, RefreshCw } from '@wso2/oxygen-ui-icons-react';
import { formatDistanceToNow } from 'date-fns';
import EmptyListing from '../components/EmptyListing';
import NotFoundView from '../components/NotFoundView';
import { getOrganization } from '../data/mockData';
import { projectCreatePath, projectOverviewPath } from '../lib/paths';
import { projects as projectsApi, type Project as ApiProject } from '../services/api';

const projectGridTemplate = {
  xs: 'repeat(1, minmax(0, 1fr))',
  md: 'repeat(2, minmax(0, 1fr))',
  lg: 'repeat(3, minmax(0, 1fr))',
  xl: 'repeat(4, minmax(0, 1fr))',
};

function ProjectCard({ project, orgId }: { project: ApiProject; orgId: string }) {
  const projectPath = projectOverviewPath(orgId, project.name);
  const description = project.description?.trim() || 'No description provided';
  const createdAtText = project.createdAt
    ? formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })
    : '—';

  return (
    <Link to={projectPath} style={{ textDecoration: 'none' }}>
      <Form.CardButton sx={{ width: '100%', textAlign: 'left' }}>
        <Form.CardContent>
          <Form.CardHeader
            title={
              <Form.Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', height: 42, width: 42 }}>
                  <Package size={24} />
                </Avatar>
                <Form.Stack direction="column" spacing={0.5} flex={1} minWidth={0}>
                  <Typography variant="h5" noWrap textOverflow="ellipsis" sx={{ maxWidth: '90%' }}>
                    {project.displayName || project.name}
                  </Typography>
                  <Typography variant="caption" color="textPrimary">
                    {description}
                  </Typography>
                </Form.Stack>
              </Form.Stack>
            }
          />
          <Form.CardActions>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <Clock size={16} opacity={0.5} />
              {createdAtText}
            </Typography>
          </Form.CardActions>
        </Form.CardContent>
      </Form.CardButton>
    </Link>
  );
}

function SkeletonGrid() {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: projectGridTemplate, gap: 2, width: '100%' }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={160} sx={{ width: '100%' }} />
      ))}
    </Box>
  );
}

export default function OrganizationOverviewPage() {
  const { orgId = '' } = useParams();
  const organization = getOrganization(orgId);

  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadProjects = useCallback(async (isRefetch = false) => {
    if (isRefetch) {
      setIsRefetching(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const allItems: ApiProject[] = [];
      let nextCursor: string | undefined;

      do {
        const response = await projectsApi.listProjects(orgId, { limit: 100, cursor: nextCursor });
        allItems.push(...response.items);
        nextCursor = response.pagination?.nextCursor;
      } while (nextCursor);

      setProjects(allItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, [orgId]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const filteredProjects = useMemo(
    () =>
      projects.filter(
        (p) =>
          !search ||
          (p.displayName ?? p.name).toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase()),
      ),
    [projects, search],
  );

  if (!organization) {
    return (
      <NotFoundView
        title="Organization not found"
        description="The requested organization does not exist."
        backTo="/"
        backLabel="Go to home"
      />
    );
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>
          <Stack direction="row" alignItems="center" gap={1}>
            All Projects
            <Box display="flex" alignItems="center" minWidth={32} justifyContent="center">
              {isRefetching ? (
                <CircularProgress size={18} color="primary" />
              ) : (
                <IconButton size="small" color="primary" onClick={() => void loadProjects(true)} disabled={isLoading}>
                  <RefreshCw size={18} />
                </IconButton>
              )}
            </Box>
          </Stack>
        </PageTitle.Header>
      </PageTitle>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Box display="flex" gap={2}>
          <Box flexGrow={1}>
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Projects"
              disabled={isLoading || projects.length === 0}
              size="small"
              fullWidth
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<Plus size={16} />}
            component={Link}
            to={generatePath(projectCreatePath(orgId))}
          >
            Add Project
          </Button>
        </Box>

        {error && (
          <Typography variant="body2" color="error.main">
            {error}
          </Typography>
        )}

        {isLoading ? (
          <SkeletonGrid />
        ) : filteredProjects.length === 0 ? (
          <EmptyListing
            icon={<Package size={48} />}
            title="No projects found"
            description={search ? 'Try adjusting your search.' : 'Create your first project to get started.'}
          />
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: projectGridTemplate, gap: 2, width: '100%' }}>
            {filteredProjects.map((project) => (
              <ProjectCard key={project.name} project={project} orgId={orgId} />
            ))}
          </Box>
        )}
      </Box>
    </PageContent>
  );
}

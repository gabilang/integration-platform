import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  PageContent,
  Select,
  Stack,
  TextField,
  Typography,
} from '@wso2/oxygen-ui';
import { ArrowLeft, CircleQuestionMark, GitBranch, GitHub, GitPullRequest, Globe } from '@wso2/oxygen-ui-icons-react';
import NotFoundView from '../components/NotFoundView';
import { getOrganization, upsertOrganizationProject } from '../data/mockData';
import { organizationOverviewPath, projectOverviewPath } from '../lib/paths';
import { mapApiProjectToProjectRecord } from '../lib/projects';
import { projects as projectsApi } from '../services/api';

type RepositoryProvider = 'github' | 'bitbucket' | 'gitlab' | 'public-github';

const providerLabels: Record<RepositoryProvider, string> = {
  github: 'Authorize with GitHub',
  bitbucket: 'Authorize with Bitbucket',
  gitlab: 'Authorize with GitLab',
  'public-github': 'Use Public GitHub Repository',
};

function toProjectName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function ProviderCard({
  title,
  selected,
  onSelect,
  icon,
  children,
}: {
  title: string;
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Card
      variant="outlined"
      onClick={onSelect}
      sx={{
        cursor: 'pointer',
        borderColor: selected ? 'primary.main' : 'divider',
        backgroundColor: selected ? 'action.hover' : 'background.paper',
        '&:hover': { borderColor: 'primary.main' },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ display: 'inline-flex', color: selected ? 'primary.main' : 'text.secondary' }}>{icon}</Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Stack>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ProjectCreatePage() {
  const { orgId = '' } = useParams();
  const navigate = useNavigate();
  const organization = getOrganization(orgId);

  const [displayName, setDisplayName] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isNameOverridden, setIsNameOverridden] = useState(false);
  const [provider, setProvider] = useState<RepositoryProvider>('github');
  const [bitbucketCredential, setBitbucketCredential] = useState('');
  const [gitlabCredential, setGitlabCredential] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isNameOverridden) {
      return;
    }

    setName(toProjectName(displayName));
  }, [displayName, isNameOverridden]);

  const repositoryUrl = useMemo(() => {
    const projectName = toProjectName(name || displayName) || 'new-project';

    switch (provider) {
      case 'bitbucket':
        return `https://bitbucket.org/${organization?.id ?? 'workspace'}/${projectName}`;
      case 'gitlab':
        return `https://gitlab.com/${organization?.id ?? 'group'}/${projectName}`;
      case 'public-github':
        return `https://github.com/public/${projectName}`;
      case 'github':
      default:
        return `https://github.com/${organization?.id ?? 'org'}/${projectName}`;
    }
  }, [displayName, name, organization?.id, provider]);

  const canCreate = Boolean(displayName.trim() && name.trim());

  const handleCreate = async () => {
    if (!canCreate || !organization) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const createdProject = await projectsApi.createProject(organization.id, {
        name: name.trim(),
        displayName: displayName.trim(),
        description: description.trim() || undefined,
        deploymentPipeline: 'default',
      });

      const mappedProject = mapApiProjectToProjectRecord(createdProject);
      upsertOrganizationProject(organization.id, {
        ...mappedProject,
        repository: mappedProject.repository || repositoryUrl,
      });

      navigate(projectOverviewPath(organization.id, mappedProject.id));
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : 'Unable to create project';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!organization) {
    return (
      <NotFoundView
        title="Organization not found"
        description="The selected organization is not available."
        backTo="/"
        backLabel="Go to home"
      />
    );
  }

  return (
    <PageContent>
      <Stack spacing={4}>
        <Button
          variant="text"
          color="inherit"
          onClick={() => navigate(organizationOverviewPath(organization.id))}
          startIcon={<ArrowLeft size={16} />}
          sx={{ alignSelf: 'flex-start', px: 0.5 }}
        >
          Back to Home
        </Button>

        <Stack spacing={3}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Create a Project
          </Typography>

          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Project Details
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Display Name"
                  placeholder="Enter Project Name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Name"
                  value={name}
                  onChange={(event) => {
                    const sanitizedName = toProjectName(event.target.value);
                    setIsNameOverridden(Boolean(sanitizedName));
                    setName(sanitizedName);
                  }}
                  fullWidth
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small">
                            <CircleQuestionMark size={16} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Description (Optional)"
                  placeholder="Enter Description here"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Stack>

          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Connect Your Repository (Optional)
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <ProviderCard
                  title={providerLabels.github}
                  selected={provider === 'github'}
                  onSelect={() => setProvider('github')}
                  icon={<GitHub size={24} />}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <ProviderCard
                  title={providerLabels.bitbucket}
                  selected={provider === 'bitbucket'}
                  onSelect={() => setProvider('bitbucket')}
                  icon={<GitBranch size={24} />}
                >
                  <Select
                    size="small"
                    value={bitbucketCredential}
                    onChange={(event) => setBitbucketCredential(String(event.target.value))}
                    fullWidth
                  >
                    <MenuItem value="">Select a Credential</MenuItem>
                    <MenuItem value="workspace-admin">Devant Workspace Admin</MenuItem>
                    <MenuItem value="workspace-read">Workspace Read-only</MenuItem>
                  </Select>
                </ProviderCard>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <ProviderCard
                  title={providerLabels.gitlab}
                  selected={provider === 'gitlab'}
                  onSelect={() => setProvider('gitlab')}
                  icon={<GitPullRequest size={24} />}
                >
                  <Select
                    size="small"
                    value={gitlabCredential}
                    onChange={(event) => setGitlabCredential(String(event.target.value))}
                    fullWidth
                  >
                    <MenuItem value="">Select a Credential</MenuItem>
                    <MenuItem value="group-owner">GitLab Group Owner</MenuItem>
                    <MenuItem value="group-reporter">GitLab Reporter</MenuItem>
                  </Select>
                </ProviderCard>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <ProviderCard
                  title={providerLabels['public-github']}
                  selected={provider === 'public-github'}
                  onSelect={() => setProvider('public-github')}
                  icon={<Globe size={24} />}
                />
              </Grid>
            </Grid>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" onClick={() => navigate(organizationOverviewPath(organization.id))}>
            Cancel
          </Button>
          <Button variant="contained" disabled={!canCreate || isSubmitting} onClick={() => void handleCreate()}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </Stack>

        {error && (
          <Typography variant="body2" color="error.main">
            {error}
          </Typography>
        )}
      </Stack>
    </PageContent>
  );
}

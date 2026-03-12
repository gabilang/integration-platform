import { Box, Button, Form, IconButton, InputAdornment, MenuItem, Select, Stack, TextField } from '@wso2/oxygen-ui';
import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { BoxIcon, Check, CircleQuestionMark, GitBranch, Pencil } from '@wso2/oxygen-ui-icons-react';
import { useOrganizations } from '../../services/api';
import { getDefaultOrganizationId, getOrganizations } from '../../data/mockData';

export default function IntegrationWizard(): JSX.Element {
  const { organizations: apiOrganizations } = useOrganizations();
  const [organization, setOrganization] = useState(() => getDefaultOrganizationId());
  const [repository, setRepository] = useState('integration-samples');
  const [branch, setBranch] = useState('main');
  const [componentDirectory, setComponentDirectory] = useState('/');
  const [displayName, setDisplayName] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>('ballerina');

  const organizationOptions = useMemo(() => {
    const normalizedFromApi = apiOrganizations.map((org) => ({
      id: (org.handle || org.id || org.name).trim(),
      name: (org.name || org.handle || org.id).trim(),
    }));

    if (normalizedFromApi.length) {
      return normalizedFromApi;
    }

    return getOrganizations().map((org) => ({
      id: org.id,
      name: org.name,
    }));
  }, [apiOrganizations]);

  useEffect(() => {
    if (!organizationOptions.length) {
      return;
    }

    const isSelectedOrganizationAvailable = organizationOptions.some((option) => option.id === organization);
    if (!isSelectedOrganizationAvailable) {
      setOrganization(organizationOptions[0].id);
    }
  }, [organization, organizationOptions]);

  const buildPresets = [
    { id: 'python', label: 'Python' },
    { id: 'java', label: 'Java' },
    { id: 'nodejs', label: 'NodeJS' },
    { id: 'go', label: 'Go' },
    { id: 'dotnet', label: '.NET' },
    { id: 'ballerina', label: 'Ballerina' },
    { id: 'php', label: 'PHP' },
    { id: 'ruby', label: 'Ruby' },
    { id: 'docker', label: 'Docker' },
    { id: 'wso2mi', label: 'WSO2 MI' },
  ];

  const handleDeploy = () => {
    // Placeholder for first-cut UI
    // eslint-disable-next-line no-alert
    alert('Integration deployment requested');
  };

  return (
    <Form.Stack spacing={4}>
      <Form.Section>
        <Form.Subheader>Repository Details</Form.Subheader>
        <Form.Body>Configure your repository settings for deployment</Form.Body>
        <Form.Stack direction="row">
          <Form.ElementWrapper label="Organization" name="organization">
            <Select id="organization" value={organization} onChange={(e) => setOrganization(e.target.value as string)} fullWidth>
              {organizationOptions.map((organizationOption) => (
                <MenuItem key={organizationOption.id} value={organizationOption.id}>
                  {organizationOption.name}
                </MenuItem>
              ))}
            </Select>
          </Form.ElementWrapper>
          <Form.ElementWrapper label="Repository" name="repository">
            <Select id="repository" value={repository} onChange={(e) => setRepository(e.target.value as string)} fullWidth>
              <MenuItem value="integration-samples">integration-samples</MenuItem>
              <MenuItem value="devant-templates">devant-templates</MenuItem>
            </Select>
          </Form.ElementWrapper>
          <Form.ElementWrapper label="Branch" name="branch">
            <Select
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value as string)}
              startAdornment={
                <InputAdornment position="start">
                  <GitBranch size={16} />
                </InputAdornment>
              }
              fullWidth
            >
              <MenuItem value="main">main</MenuItem>
              <MenuItem value="develop">develop</MenuItem>
            </Select>
          </Form.ElementWrapper>
          <Form.ElementWrapper label="Component Directory" name="componentDirectory">
            <TextField
              id="componentDirectory"
              value={componentDirectory}
              onChange={(e) => setComponentDirectory(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" edge="end">
                        <Pencil size={16} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              fullWidth
            />
          </Form.ElementWrapper>
        </Form.Stack>
      </Form.Section>

      <Form.Section>
        <Form.Subheader>Component Details</Form.Subheader>
        <Form.Body>Provide information about your integration component</Form.Body>
        <Form.Stack direction="row" spacing={2}>
          <Form.ElementWrapper label="Display Name" name="displayName">
            <TextField id="displayName" placeholder="Enter display name here" value={displayName} onChange={(e) => setDisplayName(e.target.value)} fullWidth />
          </Form.ElementWrapper>
          <Form.ElementWrapper label="Name" name="name">
            <TextField
              id="name"
              placeholder="Enter name here"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              fullWidth
            />
          </Form.ElementWrapper>
          <Form.ElementWrapper label="Description" name="description">
            <TextField id="description" placeholder="Enter description here" value={description} onChange={(e) => setDescription(e.target.value)} multiline minRows={1} fullWidth />
          </Form.ElementWrapper>
        </Form.Stack>
      </Form.Section>

      <Form.Section>
        <Form.Subheader>Build Configuration</Form.Subheader>
        <Form.Body>Select a build preset for your integration</Form.Body>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {buildPresets.map((preset) => (
            <Form.CardButton key={preset.id} onClick={() => setSelectedPreset(preset.id)} selected={selectedPreset === preset.id}>
              <Form.CardHeader
                title={
                  <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                    <BoxIcon size={32} />
                    <Form.Body>{preset.label}</Form.Body>
                  </Stack>
                }
              />
            </Form.CardButton>
          ))}
        </Box>
      </Form.Section>

      <Form.Stack direction="row">
        <Button variant="text" size="large">Cancel</Button>
        <Button variant="contained" endIcon={<Check size={16} />} size="large" onClick={handleDeploy}>
          Deploy Integration
        </Button>
      </Form.Stack>
    </Form.Stack>
  );
}

import { Box, Form } from '@wso2/oxygen-ui';
import type { JSX, ReactNode } from 'react';

export interface SampleIntegrationsSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export default function SampleIntegrationsSection({ title = 'Try a Sample Integration', description = 'Explore ready-made integrations and automations to get started quickly', children }: SampleIntegrationsSectionProps): JSX.Element {
  return (
    <Form.Stack flexGrow={1}>
      <Form.Header>{title}</Form.Header>
      <Form.Body>{description}</Form.Body>
      <Box display="flex" flexWrap="wrap" gap={2}>
        {children}
      </Box>
    </Form.Stack>
  );
}

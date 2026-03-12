import { Box, Button, Form, Stack, Typography } from '@wso2/oxygen-ui';
import { ExternalLink } from '@wso2/oxygen-ui-icons-react';
import type { JSX, ReactNode } from 'react';

export interface SampleAppCardProps {
  icon?: ReactNode;
  title: string;
  subtitle: string;
  description: string;
  onQuickDeploy?: () => void;
  onViewSource?: () => void;
  hasQuickDeploy?: boolean;
}

export default function SampleAppCard({ icon, title, subtitle, description, onQuickDeploy, onViewSource, hasQuickDeploy = true }: SampleAppCardProps): JSX.Element {
  return (
    <Form.CardButton sx={{ width: 280 }}>
      <Form.CardContent>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1}>
            <Box>{icon}</Box>
            <Form.Subheader>{title}</Form.Subheader>
          </Stack>
          <Typography variant="body2">{subtitle}</Typography>
          <Typography
            variant="caption"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </Typography>
        </Stack>
      </Form.CardContent>
      <Form.CardActions>
        {hasQuickDeploy && (
          <Button variant="outlined" size="small" onClick={onQuickDeploy}>
            Quick Deploy
          </Button>
        )}
        <Button variant="text" size="small" endIcon={<ExternalLink size={16} />} onClick={onViewSource}>
          Source
        </Button>
      </Form.CardActions>
    </Form.CardButton>
  );
}

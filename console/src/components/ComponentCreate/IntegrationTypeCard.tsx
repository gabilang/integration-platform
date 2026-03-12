import { Box, Form, Stack, Tooltip, Typography } from '@wso2/oxygen-ui';
import { CircleQuestionMark, type LucideIcon } from '@wso2/oxygen-ui-icons-react';
import type { JSX } from 'react';

export interface IntegrationTypeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tooltipText?: string;
  onClick?: () => void;
}

export default function IntegrationTypeCard({ icon, title, description, tooltipText, onClick }: IntegrationTypeCardProps): JSX.Element {
  const Icon = icon;

  return (
    <Form.CardButton alignItems="center" onClick={onClick} sx={{ width: '50%' }}>
      <Form.CardHeader
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Form.Subheader noWrap>{title}</Form.Subheader>
            {tooltipText && (
              <Form.DisappearingCardButtonContent>
                <Tooltip title={tooltipText}>
                  <CircleQuestionMark size={16} />
                </Tooltip>
              </Form.DisappearingCardButtonContent>
            )}
          </Stack>
        }
      />
      <Form.CardContent>
        <Box display="flex" py={2} justifyContent="center" alignItems="center">
          <Icon size={140} />
        </Box>
        <Box textAlign="center" width="100%">
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
        </Box>
      </Form.CardContent>
    </Form.CardButton>
  );
}

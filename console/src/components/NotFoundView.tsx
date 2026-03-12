import { Button, PageContent, Stack, Typography } from '@wso2/oxygen-ui';
import { useNavigate } from 'react-router-dom';

type NotFoundViewProps = {
  title: string;
  description: string;
  backTo: string;
  backLabel: string;
};

export default function NotFoundView({ title, description, backTo, backLabel }: NotFoundViewProps) {
  const navigate = useNavigate();

  return (
    <PageContent sx={{ py: 8 }}>
      <Stack spacing={2} alignItems="flex-start">
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
        <Button variant="outlined" onClick={() => navigate(backTo)}>
          {backLabel}
        </Button>
      </Stack>
    </PageContent>
  );
}

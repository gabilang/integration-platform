import { useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@wso2/oxygen-ui';
import { useAsgardeo } from '../auth';

export const AutoRedirectToIdP = () => {
  const { signIn, isSignedIn } = useAsgardeo();
  const signInRef = useRef(signIn);
  signInRef.current = signIn;

  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isSignedIn && !hasRedirected.current) {
      hasRedirected.current = true;
      signInRef.current();
    }
  }, [isSignedIn]);

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
      <Typography variant="body2" sx={{ mt: 2 }}>
        Redirecting to sign in...
      </Typography>
    </Box>
  );
};

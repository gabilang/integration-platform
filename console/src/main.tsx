import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AcrylicOrangeTheme, CssBaseline, OxygenUIThemeProvider } from '@wso2/oxygen-ui';
import { AsgardeoProvider } from '@asgardeo/react';
import { App } from './App';
import { env } from './config/env';
import { isBypassEnabled, MockAuthProvider } from './auth';

const defaultThunderUrl = env.VITE_THUNDER_URL || 'https://localhost:8090';
const defaultSignInUrl = env.VITE_THUNDER_AFTER_SIGN_IN_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3001');
const defaultSignOutUrl =
  env.VITE_THUNDER_AFTER_SIGN_OUT_URL ||
  (typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://localhost:3001/login');

const asgardeoConfig = {
  baseUrl: defaultThunderUrl,
  clientId: env.VITE_THUNDER_CLIENT_ID || 'wso2cloud_basic',
  ...(env.VITE_THUNDER_CLIENT_SECRET && { clientSecret: env.VITE_THUNDER_CLIENT_SECRET }),
  signInUrl: `${defaultThunderUrl}/gate`,
  afterSignInUrl: defaultSignInUrl,
  afterSignOutUrl: defaultSignOutUrl,
  scopes: (env.VITE_THUNDER_SCOPES || 'openid profile email').split(' '),
  platform: 'AsgardeoV2' as const,
  tokenValidation: {
    idToken: {
      validate: false,
    },
  },
  storage: 'localStorage' as const,
};

function AuthProviderWrapper({ children }: { children: ReactNode }) {
  if (isBypassEnabled()) {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }
  return <AsgardeoProvider {...asgardeoConfig}>{children}</AsgardeoProvider>;
}

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <AuthProviderWrapper>
      <OxygenUIThemeProvider theme={AcrylicOrangeTheme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </OxygenUIThemeProvider>
    </AuthProviderWrapper>
  </StrictMode>
);

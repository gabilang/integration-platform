import { createContext, useContext, type ReactNode } from 'react';
import { env } from '../config/env';

const MOCK_USER = {
  sub: 'dev-user-uuid-12345',
  email: 'john.doe@dev.local',
  name: 'John Doe',
  given_name: 'John',
  family_name: 'Doe',
  ouName: 'testorgdevant',
  ouHandle: 'testorgdevant',
};

export function isBypassEnabled(): boolean {
  return env.VITE_DEV_BYPASS_AUTH === 'true';
}

interface HttpRequestConfig {
  url: string;
  method: string;
  headers?: Record<string, string>;
  data?: unknown;
}

interface MockAuthState {
  isLoading: boolean;
  isSignedIn: boolean;
  user: typeof MOCK_USER | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getDecodedIdToken: () => Promise<Record<string, unknown>>;
  getAccessToken: () => Promise<string>;
  http: {
    request: <T = unknown>(config: HttpRequestConfig) => Promise<{ data: T }>;
  };
}

const MockAuthContext = createContext<MockAuthState | null>(null);

export function useMockAsgardeo(): MockAuthState {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useMockAsgardeo must be used within MockAuthProvider');
  }
  return context;
}

export function MockUser({ children }: { children: (user: typeof MOCK_USER) => ReactNode }) {
  return <>{children(MOCK_USER)}</>;
}

export function mockNavigate(path: string): void {
  window.location.href = path;
}

export function MockAuthProvider({ children }: { children: ReactNode }) {
  if (typeof window !== 'undefined') {
    console.warn(
      '%c AUTH BYPASS ACTIVE ',
      'background: #ff9800; color: black; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
      '\nUsing mock authentication: John Doe / testorgdevant',
      '\nSet VITE_DEV_BYPASS_AUTH=false to disable'
    );
  }

  const mockState: MockAuthState = {
    isLoading: false,
    isSignedIn: true,
    user: MOCK_USER,

    signIn: async () => {
      console.log('[MockAuth] signIn called - no-op in bypass mode');
    },

    signOut: async () => {
      console.log('[MockAuth] signOut called - redirecting to /login');
      window.location.href = '/login';
    },

    getDecodedIdToken: async () => ({
      sub: MOCK_USER.sub,
      email: MOCK_USER.email,
      name: MOCK_USER.name,
      given_name: MOCK_USER.given_name,
      family_name: MOCK_USER.family_name,
      ouName: MOCK_USER.ouName,
      ouHandle: MOCK_USER.ouHandle,
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),

    getAccessToken: async () => 'mock-access-token',

    http: {
      request: async function <T = unknown>(config: HttpRequestConfig) {
        const response = await fetch(config.url, {
          method: config.method,
          headers: config.headers,
          body: config.data ? JSON.stringify(config.data) : undefined,
        });

        let data: T;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          data = (await response.json()) as T;
        } else {
          data = (await response.text()) as T;
        }

        return { data };
      },
    },
  };

  return <MockAuthContext.Provider value={mockState}>{children}</MockAuthContext.Provider>;
}

export { MOCK_USER };

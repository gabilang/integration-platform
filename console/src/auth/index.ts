import { env } from '../config/env';
import {
  useAsgardeo as realUseAsgardeo,
  User as RealUser,
  navigate as realNavigate,
} from '@asgardeo/react';
import {
  useMockAsgardeo,
  MockUser,
  mockNavigate,
  isBypassEnabled,
  MockAuthProvider,
  MOCK_USER,
} from './MockAuthProvider';

const bypassEnabled = env.VITE_DEV_BYPASS_AUTH === 'true';

export const useAsgardeo = (bypassEnabled ? useMockAsgardeo : realUseAsgardeo) as typeof realUseAsgardeo;
export const User = bypassEnabled ? MockUser : RealUser;
export const navigate = bypassEnabled ? mockNavigate : realNavigate;

export { isBypassEnabled, MockAuthProvider, MOCK_USER };

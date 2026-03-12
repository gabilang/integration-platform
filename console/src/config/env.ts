interface RuntimeEnv {
  VITE_PLATFORM_IDP_URL?: string;
  VITE_CORE_DP_API_BASE_URL?: string;

  VITE_THUNDER_URL?: string;
  VITE_THUNDER_APP_ID?: string;
  VITE_THUNDER_CLIENT_ID?: string;
  VITE_THUNDER_CLIENT_SECRET?: string;
  VITE_THUNDER_REDIRECT_URI?: string;
  VITE_THUNDER_SCOPES?: string;
  VITE_THUNDER_AUTHENTICATOR?: string;
  VITE_THUNDER_AFTER_SIGN_IN_URL?: string;
  VITE_THUNDER_AFTER_SIGN_OUT_URL?: string;

  VITE_DEV_BYPASS_AUTH?: string;
}

declare global {
  interface Window {
    _env_?: RuntimeEnv;
  }
}

function getEnv(key: keyof RuntimeEnv): string | undefined {
  if (typeof window !== 'undefined' && window._env_) {
    const runtimeValue = window._env_[key];
    if (runtimeValue !== undefined && runtimeValue !== '') {
      return runtimeValue;
    }
  }

  return import.meta.env[key];
}

const platformIdpUrl = getEnv('VITE_PLATFORM_IDP_URL') || '';
const thunderUrl = getEnv('VITE_THUNDER_URL') || platformIdpUrl;

export const env = {
  VITE_PLATFORM_IDP_URL: platformIdpUrl,
  VITE_CORE_DP_API_BASE_URL: getEnv('VITE_CORE_DP_API_BASE_URL') || '/platform-api-service/wso2cloud-dp',

  VITE_THUNDER_URL: thunderUrl,
  VITE_THUNDER_APP_ID: getEnv('VITE_THUNDER_APP_ID') || '',
  VITE_THUNDER_CLIENT_ID: getEnv('VITE_THUNDER_CLIENT_ID') || '',
  VITE_THUNDER_CLIENT_SECRET: getEnv('VITE_THUNDER_CLIENT_SECRET') || '',
  VITE_THUNDER_REDIRECT_URI: getEnv('VITE_THUNDER_REDIRECT_URI') || '',
  VITE_THUNDER_SCOPES: getEnv('VITE_THUNDER_SCOPES') || 'openid profile email',
  VITE_THUNDER_AUTHENTICATOR: getEnv('VITE_THUNDER_AUTHENTICATOR') || 'BasicAuthenticator',
  VITE_THUNDER_AFTER_SIGN_IN_URL: getEnv('VITE_THUNDER_AFTER_SIGN_IN_URL') || '',
  VITE_THUNDER_AFTER_SIGN_OUT_URL: getEnv('VITE_THUNDER_AFTER_SIGN_OUT_URL') || '',

  VITE_DEV_BYPASS_AUTH: getEnv('VITE_DEV_BYPASS_AUTH') || '',
} as const;

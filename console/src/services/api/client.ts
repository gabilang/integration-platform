/**
 * OpenChoreo REST API client.
 *
 * Thin wrapper around the browser Fetch API targeting the OpenChoreo control-plane
 * server. All API modules under `src/api/` import from here rather than calling
 * fetch directly, so auth headers, base URL and error handling stay in one place.
 *
 * Base URL is read from `openChoreoBaseUrl` in the app config. The access token
 * is expected to be supplied by the caller via `setToken()` (or injected at
 * request time once the auth integration is wired up).
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

import { env } from '../../config/env';

/**
 * Base URL prefix for all API requests.
 *
 * In production the devant-console is hosted behind the wso2cloud platform-api-service
 * which proxies `/wso2cloud-dp/*` requests to the OpenChoreo CP API backend.
 * The full path through the data-plane gateway is:
 *   /platform-api-service/wso2cloud-dp/{resource-path}
 *
 * For local development a Vite proxy forwards the same prefix to
 *   http://development-wso2cloud.openchoreoapis.localhost:19080
 *
 * Value is read from the VITE_CORE_DP_API_BASE_URL env / runtime config.
 */
const BASE_URL = env.VITE_CORE_DP_API_BASE_URL;

// eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
let _getAccessToken: (() => Promise<string>) | null = null;

/**
 * Set a lazy accessor for the Bearer token.
 *
 * Pass a function that resolves the current access token (e.g. Asgardeo's
 * `getAccessToken`). The function is called on every request so the auth
 * library can transparently refresh the token between calls.
 *
 * Call with `null` to clear the accessor (e.g. after sign-out).
 */
export function setTokenAccessor(fn: (() => Promise<string>) | null): void {
  _getAccessToken = fn;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export type PaginationParams = {
  /** Maximum number of items to return (default: 20). */
  limit?: number;
  /** Opaque cursor returned by the previous page response. */
  cursor?: string;
  [key: string]: string | number | boolean | undefined;
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  // BASE_URL may be absolute (http://host/path) or relative (/path).
  // When absolute, use it directly so requests go to the correct API host
  // rather than the console's own origin.
  const isAbsolute = /^https?:\/\//.test(BASE_URL);
  const url = isAbsolute
    ? new URL(`${BASE_URL}${path}`)
    : new URL(`${BASE_URL}${path}`, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Support repeated params (arrays) by calling append multiple times
        if (Array.isArray(value)) {
          (value as string[]).forEach((v) =>
            url.searchParams.append(key, String(v))
          );
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    });
  }
  // Return full URL for cross-origin, relative path for same-origin.
  return isAbsolute ? url.href : url.pathname + url.search;
}

async function request<T>(
  method: string,
  path: string,
  options?: {
    params?: Record<string, string | number | boolean | string[] | undefined>;
    body?: unknown;
  }
): Promise<T> {
  const url = buildUrl(
    path,
    options?.params as Record<string, string | number | boolean | undefined>
  );

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (_getAccessToken) {
    const token = await _getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const init: RequestInit = { method, headers };
  if (options?.body !== undefined) {
    init.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, init);

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`OpenChoreo API error ${res.status}: ${text}`);
  }

  // 204 No Content — return empty object
  if (res.status === 204) {
    return {} as T;
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Exported client
// ---------------------------------------------------------------------------

export const openchoreoClient = {
  get: <T>(
    path: string,
    params?: Record<string, string | number | boolean | string[] | undefined>
  ) => request<T>('GET', path, { params }),

  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>('PATCH', path, { body }),

  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),

  delete: <T>(path: string, body?: unknown) =>
    request<T>('DELETE', path, { body }),
};

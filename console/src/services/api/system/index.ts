/**
 * System / meta endpoints.
 *
 * These are infrastructure-level endpoints used for health checks, readiness
 * probes and API discovery. They do not require authentication.
 *
 * OpenChoreo endpoints covered:
 *   GET /health
 *   GET /ready
 *   GET /version
 *   GET /openapi.json
 *   GET /.well-known/oauth-protected-resource
 *   GET /.well-known/openid-configuration
 */

import { openchoreoClient } from '../client';
import type { ServerStatus, VersionInfo } from '../types';

// ---------------------------------------------------------------------------
// Health / readiness
// ---------------------------------------------------------------------------

/**
 * Liveness probe — returns `{ status: "OK" }` when the server is running.
 * Maps to: GET /health
 */
export function getHealth(): Promise<ServerStatus> {
  return openchoreoClient.get<ServerStatus>('/health');
}

/**
 * Readiness probe — returns `{ status: "Ready" }` when the server is ready to
 * accept traffic (e.g. after completing startup migrations).
 * Maps to: GET /ready
 */
export function getReadiness(): Promise<ServerStatus> {
  return openchoreoClient.get<ServerStatus>('/ready');
}

// ---------------------------------------------------------------------------
// Version & API spec
// ---------------------------------------------------------------------------

/**
 * Returns build version metadata (version string, git commit, build date).
 * Maps to: GET /version
 */
export function getServerVersion(): Promise<VersionInfo> {
  return openchoreoClient.get<VersionInfo>('/version');
}

/**
 * Returns the OpenAPI 3.0 specification for the OpenChoreo API as a JSON object.
 * Useful for dynamic client generation or in-app API explorer.
 * Maps to: GET /openapi.json
 */
export function getOpenApiSpec(): Promise<Record<string, unknown>> {
  return openchoreoClient.get<Record<string, unknown>>('/openapi.json');
}

// ---------------------------------------------------------------------------
// OAuth / OIDC discovery
// ---------------------------------------------------------------------------

/**
 * Returns OAuth 2.0 protected resource metadata (RFC 9728).
 * Used by MCP clients to discover the authorization server for this API.
 * Maps to: GET /.well-known/oauth-protected-resource
 */
export function getOAuthProtectedResourceMetadata(): Promise<Record<string, unknown>> {
  return openchoreoClient.get<Record<string, unknown>>('/.well-known/oauth-protected-resource');
}

/**
 * Returns the OpenID Connect configuration for CLI / browser authentication.
 * Includes OAuth2 endpoints, external client IDs and security status flags.
 * Maps to: GET /.well-known/openid-configuration
 */
export function getOpenIdConfiguration(): Promise<Record<string, unknown>> {
  return openchoreoClient.get<Record<string, unknown>>('/.well-known/openid-configuration');
}

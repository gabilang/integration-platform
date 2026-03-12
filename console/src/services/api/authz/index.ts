/**
 * Authorization (authz) endpoints.
 *
 * Evaluate access control decisions, list available actions, and retrieve
 * the caller's authorization profile.
 *
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET  /authz/actions
 *   POST /authz/evaluate
 *   POST /authz/evaluate/batch
 *   GET  /authz/profile
 */

import { openchoreoClient } from '../client';
import type {
  AuthzAction,
  AuthzEvaluateRequest,
  AuthzEvaluateResponse,
  AuthzBatchEvaluateRequest,
  AuthzBatchEvaluateResponse,
  AuthzProfile,
} from '../types';

const BASE = '/authz';

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * Lists all available authorization actions.
 *
 * Maps to: GET /authz/actions
 */
export function listActions(): Promise<AuthzAction[]> {
  return openchoreoClient.get<AuthzAction[]>(`${BASE}/actions`);
}

// ---------------------------------------------------------------------------
// Evaluate
// ---------------------------------------------------------------------------

/**
 * Evaluates a single authorization request.
 *
 * Maps to: POST /authz/evaluate
 */
export function evaluate(
  body: AuthzEvaluateRequest
): Promise<AuthzEvaluateResponse> {
  return openchoreoClient.post<AuthzEvaluateResponse>(`${BASE}/evaluate`, body);
}

// ---------------------------------------------------------------------------
// Batch Evaluate
// ---------------------------------------------------------------------------

/**
 * Evaluates multiple authorization requests in a single call.
 *
 * Maps to: POST /authz/evaluate/batch
 */
export function batchEvaluate(
  body: AuthzBatchEvaluateRequest
): Promise<AuthzBatchEvaluateResponse> {
  return openchoreoClient.post<AuthzBatchEvaluateResponse>(
    `${BASE}/evaluate/batch`,
    body
  );
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

/**
 * Returns the authorization profile of the current caller (allowed actions
 * per resource hierarchy).
 *
 * Maps to: GET /authz/profile
 */
export function getProfile(): Promise<AuthzProfile> {
  return openchoreoClient.get<AuthzProfile>(`${BASE}/profile`);
}

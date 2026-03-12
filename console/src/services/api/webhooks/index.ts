/**
 * Webhook endpoints.
 *
 * These endpoints are called by external VCS providers (GitHub, GitLab,
 * Bitbucket) to notify OpenChoreo of push/PR events that should trigger
 * component workflow runs.
 *
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   POST /webhooks/github
 *   POST /webhooks/gitlab
 *   POST /webhooks/bitbucket
 */

import { openchoreoClient } from '../client';
import type { WebhookEventResponse } from '../types';

const BASE = '/webhooks';

// ---------------------------------------------------------------------------
// GitHub
// ---------------------------------------------------------------------------

/**
 * Processes a GitHub webhook event.
 *
 * Maps to: POST /webhooks/github
 */
export function handleGitHubWebhook(
  body: unknown
): Promise<WebhookEventResponse> {
  return openchoreoClient.post<WebhookEventResponse>(`${BASE}/github`, body);
}

// ---------------------------------------------------------------------------
// GitLab
// ---------------------------------------------------------------------------

/**
 * Processes a GitLab webhook event.
 *
 * Maps to: POST /webhooks/gitlab
 */
export function handleGitLabWebhook(
  body: unknown
): Promise<WebhookEventResponse> {
  return openchoreoClient.post<WebhookEventResponse>(`${BASE}/gitlab`, body);
}

// ---------------------------------------------------------------------------
// Bitbucket
// ---------------------------------------------------------------------------

/**
 * Processes a Bitbucket webhook event.
 *
 * Maps to: POST /webhooks/bitbucket
 */
export function handleBitbucketWebhook(
  body: unknown
): Promise<WebhookEventResponse> {
  return openchoreoClient.post<WebhookEventResponse>(`${BASE}/bitbucket`, body);
}

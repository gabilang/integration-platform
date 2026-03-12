/**
 * ObservabilityAlertsNotificationChannel endpoints (namespace-scoped).
 *
 * Configures destinations for alerting notifications (Slack, email, webhook, PagerDuty).
 *
 * OpenChoreo CRD: `ObservabilityAlertsNotificationChannel` (openchoreo.dev/v1alpha1)
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET    /namespaces/{namespaceName}/observabilityalertsnotificationchannels
 *   POST   /namespaces/{namespaceName}/observabilityalertsnotificationchannels
 *   GET    /namespaces/{namespaceName}/observabilityalertsnotificationchannels/{channelName}
 *   PUT    /namespaces/{namespaceName}/observabilityalertsnotificationchannels/{channelName}
 *   DELETE /namespaces/{namespaceName}/observabilityalertsnotificationchannels/{channelName}
 */

import { openchoreoClient } from '../../client';
import type { PaginationParams } from '../../client';
import type {
  ObservabilityAlertsNotificationChannel,
  CreateObservabilityAlertsNotificationChannelRequest,
  UpdateObservabilityAlertsNotificationChannelRequest,
  PaginatedList,
} from '../../types';

function base(ns: string): string {
  return `/namespaces/${ns}/observabilityalertsnotificationchannels`;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of notification channels in the namespace.
 *
 * Maps to: GET /namespaces/{namespaceName}/observabilityalertsnotificationchannels
 */
export function listNotificationChannels(
  namespaceName: string,
  pagination?: PaginationParams
): Promise<PaginatedList<ObservabilityAlertsNotificationChannel>> {
  return openchoreoClient.get<
    PaginatedList<ObservabilityAlertsNotificationChannel>
  >(base(namespaceName), pagination);
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Creates a new notification channel in the namespace.
 *
 * Maps to: POST /namespaces/{namespaceName}/observabilityalertsnotificationchannels
 */
export function createNotificationChannel(
  namespaceName: string,
  body: CreateObservabilityAlertsNotificationChannelRequest
): Promise<ObservabilityAlertsNotificationChannel> {
  return openchoreoClient.post<ObservabilityAlertsNotificationChannel>(
    base(namespaceName),
    body
  );
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single notification channel by name.
 *
 * Maps to: GET /namespaces/{namespaceName}/observabilityalertsnotificationchannels/{channelName}
 */
export function getNotificationChannel(
  namespaceName: string,
  channelName: string
): Promise<ObservabilityAlertsNotificationChannel> {
  return openchoreoClient.get<ObservabilityAlertsNotificationChannel>(
    `${base(namespaceName)}/${channelName}`
  );
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Replaces the mutable fields of a notification channel.
 *
 * Maps to: PUT /namespaces/{namespaceName}/observabilityalertsnotificationchannels/{channelName}
 */
export function updateNotificationChannel(
  namespaceName: string,
  channelName: string,
  body: UpdateObservabilityAlertsNotificationChannelRequest
): Promise<ObservabilityAlertsNotificationChannel> {
  return openchoreoClient.put<ObservabilityAlertsNotificationChannel>(
    `${base(namespaceName)}/${channelName}`,
    body
  );
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Deletes a notification channel by name.
 *
 * Maps to: DELETE /namespaces/{namespaceName}/observabilityalertsnotificationchannels/{channelName}
 */
export function deleteNotificationChannel(
  namespaceName: string,
  channelName: string
): Promise<void> {
  return openchoreoClient.delete<void>(`${base(namespaceName)}/${channelName}`);
}

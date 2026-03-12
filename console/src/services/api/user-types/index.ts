/**
 * UserType endpoints.
 *
 * User types define the available identity types (e.g. human user, service account)
 * and their authentication mechanisms.
 *
 * Docs: https://openchoreo.dev/docs/v0.14.x/
 *
 * Endpoints covered:
 *   GET /usertypes
 *   GET /usertypes/{userTypeName}
 */

import { openchoreoClient } from '../client';
import type { UserType } from '../types';

const BASE = '/usertypes';

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/**
 * Lists all available user types.
 *
 * Maps to: GET /usertypes
 */
export function listUserTypes(): Promise<UserType[]> {
  return openchoreoClient.get<UserType[]>(BASE);
}

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

/**
 * Returns a single user type by name.
 *
 * Maps to: GET /usertypes/{userTypeName}
 */
export function getUserType(userTypeName: string): Promise<UserType> {
  return openchoreoClient.get<UserType>(`${BASE}/${userTypeName}`);
}

/**
 * Authentication and authorization contract shared between the backend and the
 * frontend. Keep both sides in sync by importing these instead of redefining them.
 */

/** Identity providers a user can sign in with. Extend as providers are implemented. */
export const AUTH_PROVIDERS = ["yandex"] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

/** The signed-in user, as exposed by the API. */
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

/** A caller's relationship to a table. */
export const TABLE_ACCESS_ROLES = ["owner", "judge", "viewer"] as const;
export type TableAccessRole = (typeof TABLE_ACCESS_ROLES)[number];

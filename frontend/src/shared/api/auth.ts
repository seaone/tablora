import { APP_CONFIG } from "@/shared/config";
import type { AuthProvider, AuthUser } from "@tablora/shared";

export type { AuthProvider, AuthUser };

/** Current user, or null when signed out. Never throws on a missing session. */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch(`${APP_CONFIG.apiUrl}/api/auth/me`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { user: AuthUser | null };
  return data.user ?? null;
}

/** URL that starts sign-in for a provider, returning to `returnTo` afterwards. */
export function signInUrl(provider: AuthProvider, returnTo?: string): string {
  const base = `${APP_CONFIG.apiUrl}/api/auth/${provider}`;
  return returnTo ? `${base}?returnTo=${encodeURIComponent(returnTo)}` : base;
}

export async function signOut(): Promise<void> {
  await fetch(`${APP_CONFIG.apiUrl}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

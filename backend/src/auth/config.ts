import type { AuthUser } from '@tablora/shared'

export type { AuthUser }

/** Name of the httpOnly cookie holding the session token. */
export const AUTH_COOKIE_NAME = 'tablora_session'

/** Short-lived cookie carrying the post-login redirect target through the OAuth flow. */
export const RETURN_TO_COOKIE_NAME = 'tablora_return_to'

/** How long a sign-in lasts. */
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

function readEnv(name: string, fallback: string): string {
  const value = process.env[name]
  if (value) return value
  if (isProduction()) {
    throw new Error(`Environment variable ${name} must be set in production`)
  }
  return fallback
}

export const authConfig = {
  /** Browser origin: the allowed CORS origin and the post-login redirect target. */
  frontendUrl: readEnv('FRONTEND_URL', process.env.CORS_ORIGIN || 'http://localhost:3000'),
  jwtSecret: readEnv('AUTH_JWT_SECRET', 'dev-insecure-secret-do-not-use-in-production'),
  yandex: {
    clientId: readEnv('YANDEX_CLIENT_ID', 'dev-yandex-client-id'),
    clientSecret: readEnv('YANDEX_CLIENT_SECRET', 'dev-yandex-client-secret'),
    redirectUri: readEnv('YANDEX_REDIRECT_URI', 'http://localhost:4000/api/auth/yandex/callback'),
  },
}

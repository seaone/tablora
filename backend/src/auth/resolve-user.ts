import type { FastifyInstance, FastifyRequest } from 'fastify'
import { AUTH_COOKIE_NAME } from './config.js'
import { isSessionActive } from './session.js'

/** Claims carried by the session JWT. */
export interface SessionTokenPayload {
  sub: string
  email: string
  displayName: string
  jti: string
}

/**
 * Runs on every request: verifies the session cookie and attaches the signed-in
 * user (or null). Never rejects a request — authorization is enforced separately.
 */
export async function resolveUser(this: FastifyInstance, request: FastifyRequest): Promise<void> {
  request.authUser = null

  const token = request.cookies?.[AUTH_COOKIE_NAME]
  if (!token) return

  try {
    const payload = this.jwt.verify<SessionTokenPayload>(token)
    if (!payload?.jti || !payload.sub) return
    if (!(await isSessionActive(payload.jti, payload.sub))) return
    request.authUser = {
      id: payload.sub,
      email: payload.email,
      displayName: payload.displayName,
    }
  } catch {
    // Invalid or expired token: treat the request as anonymous.
  }
}

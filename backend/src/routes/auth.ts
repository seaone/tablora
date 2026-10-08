import type { FastifyPluginAsync } from 'fastify'
import {
  AUTH_COOKIE_NAME,
  RETURN_TO_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  authConfig,
  isProduction,
} from '../auth/config.js'
import { createSession, deleteSession } from '../auth/session.js'
import type { SessionTokenPayload } from '../auth/resolve-user.js'
import { fetchYandexProfile, upsertUserFromYandex } from '../auth/yandex.js'

/** Accepts only same-site absolute paths (no scheme, no protocol-relative URL). */
export function sanitizeReturnTo(value: unknown): string | null {
  if (typeof value !== 'string') return null
  if (!value.startsWith('/') || value.startsWith('//')) return null
  return value
}

function sessionCookieOptions() {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProduction(),
    maxAge: SESSION_TTL_SECONDS,
  }
}

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Start the Yandex flow: remember where to return, then redirect to Yandex.
  fastify.get('/api/auth/yandex', async (request, reply) => {
    const returnTo = sanitizeReturnTo((request.query as { returnTo?: string }).returnTo)
    if (returnTo) {
      reply.setCookie(RETURN_TO_COOKIE_NAME, returnTo, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction(),
        maxAge: 600,
      })
    }

    const uri = await fastify.oauth2Yandex!.generateAuthorizationUri(request, reply)
    return reply.redirect(uri)
  })

  // Yandex redirects back here with a code (or an error).
  fastify.get('/api/auth/yandex/callback', async (request, reply) => {
    const returnTo = sanitizeReturnTo(request.cookies[RETURN_TO_COOKIE_NAME]) ?? '/'
    reply.clearCookie(RETURN_TO_COOKIE_NAME, { path: '/' })

    try {
      const { token } = await fastify.oauth2Yandex!.getAccessTokenFromAuthorizationCodeFlow(request)
      const profile = await fetchYandexProfile(token.access_token)
      const user = await upsertUserFromYandex(profile)
      const session = await createSession(user.id)

      const payload: SessionTokenPayload = {
        sub: user.id,
        email: user.email,
        displayName: user.displayName,
        jti: session.id,
      }
      reply.setCookie(AUTH_COOKIE_NAME, fastify.jwt.sign(payload), sessionCookieOptions())

      return reply.redirect(`${authConfig.frontendUrl}${returnTo}`)
    } catch (err) {
      request.log.error({ err }, 'Yandex sign-in failed')
      return reply.redirect(`${authConfig.frontendUrl}/?authError=1`)
    }
  })

  // Current user, or null when signed out.
  fastify.get('/api/auth/me', async (request) => {
    return { user: request.authUser }
  })

  fastify.post('/api/auth/logout', async (request, reply) => {
    const token = request.cookies[AUTH_COOKIE_NAME]
    if (token) {
      try {
        const payload = fastify.jwt.verify<SessionTokenPayload>(token)
        if (payload?.jti) await deleteSession(payload.jti)
      } catch {
        // Ignore an invalid or expired token; the cookie is cleared regardless.
      }
    }
    reply.clearCookie(AUTH_COOKIE_NAME, { path: '/' })
    return { success: true }
  })
}

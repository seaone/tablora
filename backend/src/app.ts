import Fastify from 'fastify'
import cors from '@fastify/cors'
import sensible from '@fastify/sensible'
import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import oauth2 from '@fastify/oauth2'
import { tableRoutes } from './routes/tables.js'
import { authRoutes } from './routes/auth.js'
import { authConfig, SESSION_TTL_SECONDS } from './auth/config.js'
import { resolveUser } from './auth/resolve-user.js'

export function buildApp(opts = {}) {
  const isTest = process.env.NODE_ENV === 'test'
  const app = Fastify({
    logger: isTest ? false : { level: process.env.LOG_LEVEL || 'info' },
    ...opts,
  })

  app.register(cors, {
    // Reflect the request origin so judges' phones on the LAN work, not just the
    // configured frontend origin. Session cookies are SameSite=Lax, so a reflected
    // origin cannot turn a cross-site request into an authenticated one.
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  app.register(sensible)

  // Cookie must be registered before jwt/oauth2 read request.cookies; oauth2
  // registers it only if it is not already present.
  app.register(cookie)

  app.register(jwt, {
    secret: authConfig.jwtSecret,
    sign: { expiresIn: SESSION_TTL_SECONDS },
  })

  app.register(oauth2, {
    name: 'yandex',
    scope: ['login:email', 'login:info'],
    credentials: {
      client: {
        id: authConfig.yandex.clientId,
        secret: authConfig.yandex.clientSecret,
      },
      auth: {
        authorizeHost: 'https://oauth.yandex.ru',
        authorizePath: '/authorize',
        tokenHost: 'https://oauth.yandex.ru',
        tokenPath: '/token',
      },
    },
    callbackUri: authConfig.yandex.redirectUri,
  })

  app.decorateRequest('authUser', null)
  app.addHook('onRequest', resolveUser)

  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  app.register(authRoutes)
  app.register(tableRoutes)

  return app
}

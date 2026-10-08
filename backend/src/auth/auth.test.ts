import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { and, eq } from 'drizzle-orm'
import { buildApp } from '../app.js'
import { db } from '../db/index.js'
import { users, identities } from '../db/schema.js'
import { createTestUser, sessionCookies } from '../test-utils/auth.js'
import { AUTH_COOKIE_NAME, authConfig } from '../auth/config.js'
import { createSession } from '../auth/session.js'
import type { SessionTokenPayload } from '../auth/resolve-user.js'

let app: ReturnType<typeof buildApp>

before(async () => {
  app = buildApp()
  await app.ready()
})

after(async () => {
  await app.close()
})

function headerValue(res: { headers: Record<string, unknown> }, name: string): string {
  const value = res.headers[name]
  return Array.isArray(value) ? value.join('\n') : String(value ?? '')
}

/** Replaces the plugin's token exchange so tests never call Yandex. */
function stubTokenExchange(impl: () => Promise<unknown>) {
  ;(app as unknown as { oauth2Yandex: Record<string, unknown> }).oauth2Yandex.getAccessTokenFromAuthorizationCodeFlow = impl
}

/** Replaces the global fetch used by the profile request. */
async function withStubbedProfile<T>(profile: unknown, run: () => Promise<T>): Promise<T> {
  const original = globalThis.fetch
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(profile), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })) as typeof fetch
  try {
    return await run()
  } finally {
    globalThis.fetch = original
  }
}

test('callback signs in, creates the user and identity, and sets a session cookie', async () => {
  const providerUserId = `yandex-${Date.now()}-${Math.random().toString(36).slice(2)}`
  stubTokenExchange(async () => ({ token: { access_token: 'test-token' } }))

  const res = await withStubbedProfile(
    { id: providerUserId, default_email: 'Judge@Example.com', real_name: 'Судья' },
    () => app.inject({ method: 'GET', url: '/api/auth/yandex/callback?code=abc&state=xyz' }),
  )

  assert.equal(res.statusCode, 302)
  assert.ok(res.headers.location?.startsWith(authConfig.frontendUrl))
  assert.ok(headerValue(res, 'set-cookie').includes(AUTH_COOKIE_NAME))

  const [identity] = await db
    .select()
    .from(identities)
    .where(
      and(
        eq(identities.provider, 'yandex'),
        eq(identities.providerUserId, providerUserId),
      ),
    )
  assert.ok(identity, 'identity should be created')
  assert.equal(identity.email, 'judge@example.com')

  const [user] = await db.select().from(users).where(eq(users.id, identity.userId))
  assert.equal(user.displayName, 'Судья')

  await db.delete(users).where(eq(users.id, identity.userId))
})

test('callback reuses the user for a returning account (no duplicate)', async () => {
  const providerUserId = `yandex-${Date.now()}-${Math.random().toString(36).slice(2)}`
  stubTokenExchange(async () => ({ token: { access_token: 'test-token' } }))

  const profile = { id: providerUserId, default_email: 'returning@example.com', real_name: 'Возвращающийся' }
  await withStubbedProfile(profile, () =>
    app.inject({ method: 'GET', url: '/api/auth/yandex/callback?code=abc&state=xyz' }),
  )
  await withStubbedProfile(profile, () =>
    app.inject({ method: 'GET', url: '/api/auth/yandex/callback?code=abc&state=xyz' }),
  )

  const rows = await db
    .select()
    .from(identities)
    .where(
      and(eq(identities.provider, 'yandex'), eq(identities.providerUserId, providerUserId)),
    )
  assert.equal(rows.length, 1, 'one identity for the account')
  const userIds = await db.select().from(users).where(eq(users.id, rows[0].userId))
  assert.equal(userIds.length, 1, 'one user for the account')

  await db.delete(users).where(eq(users.id, rows[0].userId))
})

test('callback redirects with an error and sets no session when the exchange fails', async () => {
  stubTokenExchange(async () => {
    throw new Error('invalid_grant')
  })

  const res = await app.inject({
    method: 'GET',
    url: '/api/auth/yandex/callback?error=access_denied',
  })

  assert.equal(res.statusCode, 302)
  assert.ok(res.headers.location?.includes('authError=1'))
  assert.ok(!headerValue(res, 'set-cookie').includes(AUTH_COOKIE_NAME))
})

test('GET /api/auth/me reports the user when signed in and null otherwise', async () => {
  const user = await createTestUser()
  const cookies = await sessionCookies(app, user)

  const signedIn = await app.inject({ method: 'GET', url: '/api/auth/me', cookies })
  assert.equal(JSON.parse(signedIn.payload).user.id, user.id)

  const anonymous = await app.inject({ method: 'GET', url: '/api/auth/me' })
  assert.equal(JSON.parse(anonymous.payload).user, null)

  await db.delete(users).where(eq(users.id, user.id))
})

test('logout revokes the session so the same cookie is no longer signed in', async () => {
  const user = await createTestUser()
  const cookies = await sessionCookies(app, user)

  const logout = await app.inject({ method: 'POST', url: '/api/auth/logout', cookies })
  assert.equal(logout.statusCode, 200)

  const me = await app.inject({ method: 'GET', url: '/api/auth/me', cookies })
  assert.equal(JSON.parse(me.payload).user, null)

  await db.delete(users).where(eq(users.id, user.id))
})

test('an expired session reads as signed out', async () => {
  const user = await createTestUser()
  const session = await createSession(user.id, -60)
  const payload: SessionTokenPayload = {
    sub: user.id,
    email: user.email,
    displayName: user.displayName,
    jti: session.id,
  }
  const token = app.jwt.sign(payload)

  const me = await app.inject({
    method: 'GET',
    url: '/api/auth/me',
    cookies: { [AUTH_COOKIE_NAME]: token },
  })
  assert.equal(JSON.parse(me.payload).user, null)

  await db.delete(users).where(eq(users.id, user.id))
})

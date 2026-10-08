import { nanoid } from 'nanoid'
import type { FastifyInstance } from 'fastify'
import { db } from '../db/index.js'
import { users, type User } from '../db/schema.js'
import { AUTH_COOKIE_NAME } from '../auth/config.js'
import { createSession } from '../auth/session.js'
import type { SessionTokenPayload } from '../auth/resolve-user.js'

/** Creates a user row for tests. */
export async function createTestUser(overrides: Partial<Pick<User, 'email' | 'displayName'>> = {}): Promise<User> {
  const id = nanoid(21)
  const [user] = await db
    .insert(users)
    .values({
      id,
      email: overrides.email ?? `user-${id}@example.com`,
      displayName: overrides.displayName ?? 'Тестовый пользователь',
    })
    .returning()
  return user
}

/**
 * Creates a session for the user and returns a cookie map for `app.inject`,
 * replicating what the callback route sets after a successful sign-in.
 */
export async function sessionCookies(app: FastifyInstance, user: User): Promise<Record<string, string>> {
  await app.ready()
  const session = await createSession(user.id)
  const payload: SessionTokenPayload = {
    sub: user.id,
    email: user.email,
    displayName: user.displayName,
    jti: session.id,
  }
  return { [AUTH_COOKIE_NAME]: app.jwt.sign(payload) }
}

import { nanoid } from 'nanoid'
import { eq, lt } from 'drizzle-orm'
import { db } from '../db/index.js'
import { sessions } from '../db/schema.js'
import { SESSION_TTL_SECONDS } from './config.js'

export interface CreatedSession {
  id: string
  expiresAt: Date
}

/** Records a new session row. The returned id is the session JWT's `jti`. */
export async function createSession(
  userId: string,
  ttlSeconds: number = SESSION_TTL_SECONDS,
): Promise<CreatedSession> {
  const id = nanoid(21)
  const now = Date.now()
  // Opportunistic cleanup so expired sessions do not accumulate forever.
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date(now)))
  const expiresAt = new Date(now + ttlSeconds * 1000)
  await db.insert(sessions).values({ id, userId, expiresAt })
  return { id, expiresAt }
}

/** True when the session exists, belongs to the user, and has not expired. */
export async function isSessionActive(sessionId: string, userId: string): Promise<boolean> {
  const [row] = await db.select().from(sessions).where(eq(sessions.id, sessionId))
  if (!row || row.userId !== userId) return false
  return row.expiresAt.getTime() > Date.now()
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId))
}

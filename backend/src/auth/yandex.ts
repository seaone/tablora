import { AUTH_PROVIDERS, type AuthProvider } from '@tablora/shared'
import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { db } from '../db/index.js'
import { identities, users, type User } from '../db/schema.js'

export const YANDEX_PROVIDER: AuthProvider = AUTH_PROVIDERS[0]

const YANDEX_USERINFO_URL = 'https://login.yandex.ru/info?format=json'

export interface YandexProfile {
  providerUserId: string
  email: string
  displayName: string
}

interface YandexUserInfo {
  id?: string
  login?: string
  default_email?: string
  emails?: string[]
  real_name?: string
  display_name?: string
}

/** Reads the signed-in user's profile from Yandex using the OAuth access token. */
export async function fetchYandexProfile(accessToken: string): Promise<YandexProfile> {
  const res = await fetch(YANDEX_USERINFO_URL, {
    headers: { Authorization: `OAuth ${accessToken}` },
  })
  if (!res.ok) {
    throw new Error(`Yandex profile request failed with status ${res.status}`)
  }

  const data = (await res.json()) as YandexUserInfo
  const email = data.default_email || data.emails?.[0]
  if (!data.id || !email) {
    throw new Error('Yandex profile is missing an id or email')
  }

  return {
    providerUserId: String(data.id),
    email: email.toLowerCase(),
    displayName: data.real_name || data.display_name || data.login || email,
  }
}

/**
 * Finds or creates the user for a Yandex account. Identities are keyed by
 * (provider, providerUserId), so the same account never creates a second user.
 */
export async function upsertUserFromYandex(profile: YandexProfile): Promise<User> {
  const [identity] = await db
    .select()
    .from(identities)
    .where(
      and(
        eq(identities.provider, YANDEX_PROVIDER),
        eq(identities.providerUserId, profile.providerUserId),
      ),
    )

  const now = new Date()

  if (identity) {
    await db.update(identities).set({ email: profile.email }).where(eq(identities.id, identity.id))
    const [user] = await db
      .update(users)
      .set({ email: profile.email, displayName: profile.displayName, updatedAt: now })
      .where(eq(users.id, identity.userId))
      .returning()
    return user
  }

  const userId = nanoid(21)
  const [user] = await db
    .insert(users)
    .values({ id: userId, email: profile.email, displayName: profile.displayName })
    .returning()

  const [createdIdentity] = await db
    .insert(identities)
    .values({
      id: nanoid(21),
      userId,
      provider: YANDEX_PROVIDER,
      providerUserId: profile.providerUserId,
      email: profile.email,
    })
    .onConflictDoNothing()
    .returning()

  if (createdIdentity) return user

  // A concurrent first sign-in won the identity; discard the extra user.
  await db.delete(users).where(eq(users.id, userId))
  const [winner] = await db
    .select()
    .from(identities)
    .where(
      and(
        eq(identities.provider, YANDEX_PROVIDER),
        eq(identities.providerUserId, profile.providerUserId),
      ),
    )
  const [winnerUser] = await db.select().from(users).where(eq(users.id, winner.userId))
  return winnerUser
}

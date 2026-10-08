import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { eq } from 'drizzle-orm'
import { buildApp } from '../app.js'
import { db } from '../db/index.js'
import { tables, users, type User } from '../db/schema.js'
import { createTestUser, sessionCookies } from '../test-utils/auth.js'

let app: ReturnType<typeof buildApp>
let owner: User
let judge: User
let outsider: User
let ownerCookies: Record<string, string>
let judgeCookies: Record<string, string>
let outsiderCookies: Record<string, string>
let ownedTableId: string
let sharedTableId: string
let ownerAlsoJudgeId: string

interface DirectoryEntry {
  id: string
  title: string
  description: string | null
  createdAt: string
  updatedAt: string
  role: string
}

async function createTable(cookies: Record<string, string>, title: string): Promise<string> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/tables',
    payload: { title, columns: [{ name: 'Баллы', type: 'number' }], participants: [{ name: 'A' }] },
    cookies,
  })
  assert.equal(res.statusCode, 201)
  return JSON.parse(res.payload).id
}

async function invite(
  cookies: Record<string, string>,
  tableId: string,
  email: string,
): Promise<void> {
  const res = await app.inject({
    method: 'POST',
    url: `/api/tables/${tableId}/judges`,
    payload: { email },
    cookies,
  })
  assert.equal(res.statusCode, 201)
}

async function listDirectory(cookies: Record<string, string>): Promise<DirectoryEntry[]> {
  const res = await app.inject({ method: 'GET', url: '/api/tables', cookies })
  assert.equal(res.statusCode, 200)
  return JSON.parse(res.payload).tables as DirectoryEntry[]
}

before(async () => {
  app = buildApp()
  await app.ready()

  owner = await createTestUser()
  judge = await createTestUser()
  outsider = await createTestUser()
  ownerCookies = await sessionCookies(app, owner)
  judgeCookies = await sessionCookies(app, judge)
  outsiderCookies = await sessionCookies(app, outsider)

  ownedTableId = await createTable(ownerCookies, 'Только владельца')
  sharedTableId = await createTable(ownerCookies, 'Судит судья')
  ownerAlsoJudgeId = await createTable(ownerCookies, 'Владелец и судья')

  await invite(ownerCookies, sharedTableId, judge.email)
  // The owner is also on their own judge list — the table must still appear once, as owner.
  await invite(ownerCookies, ownerAlsoJudgeId, owner.email)
})

after(async () => {
  await db.delete(tables).where(eq(tables.id, ownedTableId))
  await db.delete(tables).where(eq(tables.id, sharedTableId))
  await db.delete(tables).where(eq(tables.id, ownerAlsoJudgeId))
  await db.delete(users).where(eq(users.id, owner.id))
  await db.delete(users).where(eq(users.id, judge.id))
  await db.delete(users).where(eq(users.id, outsider.id))
  await app.close()
})

test('the directory requires authentication', async () => {
  const anonymous = await app.inject({ method: 'GET', url: '/api/tables' })
  assert.equal(anonymous.statusCode, 401)
})

test('a user sees the tables they own, labeled as owner', async () => {
  const entries = await listDirectory(ownerCookies)
  const owned = entries.find((e) => e.id === ownedTableId)
  assert.ok(owned)
  assert.equal(owned.role, 'owner')
})

test('a user sees the tables they judge, labeled as judge', async () => {
  const entries = await listDirectory(judgeCookies)
  const judged = entries.find((e) => e.id === sharedTableId)
  assert.ok(judged)
  assert.equal(judged.role, 'judge')
  assert.equal(entries.length, 1)
})

test('tables the caller neither owns nor judges are excluded', async () => {
  const entries = await listDirectory(outsiderCookies)
  assert.equal(entries.length, 0)
})

test('a table the caller both owns and judges appears once, as owner', async () => {
  const entries = await listDirectory(ownerCookies)
  const matches = entries.filter((e) => e.id === ownerAlsoJudgeId)
  assert.equal(matches.length, 1)
  assert.equal(matches[0].role, 'owner')
})

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
let tableId: string
let tableToDeleteId: string

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

before(async () => {
  app = buildApp()
  await app.ready()

  owner = await createTestUser()
  judge = await createTestUser()
  outsider = await createTestUser()
  ownerCookies = await sessionCookies(app, owner)
  judgeCookies = await sessionCookies(app, judge)
  outsiderCookies = await sessionCookies(app, outsider)

  tableId = await createTable(ownerCookies, 'Основная')
  tableToDeleteId = await createTable(ownerCookies, 'На удаление')

  // Authorize the judge by email.
  const invite = await app.inject({
    method: 'POST',
    url: `/api/tables/${tableId}/judges`,
    payload: { email: judge.email },
    cookies: ownerCookies,
  })
  assert.equal(invite.statusCode, 201)
})

after(async () => {
  await db.delete(tables).where(eq(tables.id, tableId))
  await db.delete(tables).where(eq(tables.id, tableToDeleteId))
  await db.delete(users).where(eq(users.id, owner.id))
  await db.delete(users).where(eq(users.id, judge.id))
  await db.delete(users).where(eq(users.id, outsider.id))
  await app.close()
})

test('creating a table requires authentication and records the owner', async () => {
  const anonymous = await app.inject({
    method: 'POST',
    url: '/api/tables',
    payload: { title: 'X', columns: [], participants: [] },
  })
  assert.equal(anonymous.statusCode, 401)

  const created = await app.inject({
    method: 'POST',
    url: '/api/tables',
    payload: { title: 'Своя', columns: [{ name: 'C', type: 'text' }], participants: [] },
    cookies: ownerCookies,
  })
  assert.equal(created.statusCode, 201)
  const body = JSON.parse(created.payload)
  assert.equal(body.ownerId, owner.id)
  await db.delete(tables).where(eq(tables.id, body.id))
})

test('table reads stay public for spectators', async () => {
  const res = await app.inject({ method: 'GET', url: `/api/tables/${tableId}` })
  assert.equal(res.statusCode, 200)
})

test('access endpoint reports the caller role', async () => {
  const asOwner = await app.inject({ method: 'GET', url: `/api/tables/${tableId}/access`, cookies: ownerCookies })
  const asJudge = await app.inject({ method: 'GET', url: `/api/tables/${tableId}/access`, cookies: judgeCookies })
  const asOutsider = await app.inject({ method: 'GET', url: `/api/tables/${tableId}/access`, cookies: outsiderCookies })
  const asAnonymous = await app.inject({ method: 'GET', url: `/api/tables/${tableId}/access` })

  assert.equal(JSON.parse(asOwner.payload).role, 'owner')
  assert.equal(JSON.parse(asJudge.payload).role, 'judge')
  assert.equal(JSON.parse(asOutsider.payload).role, 'viewer')
  assert.equal(JSON.parse(asAnonymous.payload).role, 'viewer')
})

test('mutations are allowed for the owner and an authorized judge', async () => {
  const byOwner = await app.inject({
    method: 'POST',
    url: `/api/tables/${tableId}/participants`,
    payload: { name: 'От владельца' },
    cookies: ownerCookies,
  })
  assert.equal(byOwner.statusCode, 201)

  const byJudge = await app.inject({
    method: 'POST',
    url: `/api/tables/${tableId}/participants`,
    payload: { name: 'От судьи' },
    cookies: judgeCookies,
  })
  assert.equal(byJudge.statusCode, 201)
})

test('mutations are rejected for a signed-in non-judge and for anonymous callers', async () => {
  const unauthorized = await app.inject({
    method: 'POST',
    url: `/api/tables/${tableId}/participants`,
    payload: { name: 'Нельзя' },
    cookies: outsiderCookies,
  })
  assert.equal(unauthorized.statusCode, 403)

  const anonymous = await app.inject({
    method: 'POST',
    url: `/api/tables/${tableId}/participants`,
    payload: { name: 'Нельзя' },
  })
  assert.equal(anonymous.statusCode, 401)
})

test('participant and column deletes are scoped to the table in the URL', async () => {
  const tableA = await createTable(ownerCookies, 'Своя')
  const tableB = await createTable(judgeCookies, 'Чужая')

  const readTable = async (id: string) =>
    JSON.parse((await app.inject({ method: 'GET', url: `/api/tables/${id}` })).payload)

  const a = await readTable(tableA)
  const b = await readTable(tableB)

  const deleteParticipant = await app.inject({
    method: 'DELETE',
    url: `/api/tables/${tableA}/participants/${b.participants[0].id}`,
    cookies: ownerCookies,
  })
  assert.equal(deleteParticipant.statusCode, 404)
  assert.equal((await readTable(tableB)).participants.length, b.participants.length)

  const deleteColumn = await app.inject({
    method: 'DELETE',
    url: `/api/tables/${tableA}/columns/${b.columns[0].id}`,
    cookies: ownerCookies,
  })
  assert.equal(deleteColumn.statusCode, 404)
  assert.equal((await readTable(tableB)).columns.length, b.columns.length)

  const foreignColumnScore = await app.inject({
    method: 'PUT',
    url: `/api/tables/${tableA}/participants/${a.participants[0].id}/scores`,
    payload: { scores: { [b.columns[0].id]: '5' } },
    cookies: ownerCookies,
  })
  assert.equal(foreignColumnScore.statusCode, 400)

  await db.delete(tables).where(eq(tables.id, tableA))
  await db.delete(tables).where(eq(tables.id, tableB))
})

test('judge management is owner-only and idempotent', async () => {
  const list = await app.inject({ method: 'GET', url: `/api/tables/${tableId}/judges`, cookies: ownerCookies })
  assert.equal(list.statusCode, 200)
  assert.ok(JSON.parse(list.payload).judges.some((j: { email: string }) => j.email === judge.email.toLowerCase()))

  const notOwner = await app.inject({ method: 'GET', url: `/api/tables/${tableId}/judges`, cookies: judgeCookies })
  assert.equal(notOwner.statusCode, 403)

  const invalid = await app.inject({
    method: 'POST',
    url: `/api/tables/${tableId}/judges`,
    payload: { email: 'not-an-email' },
    cookies: ownerCookies,
  })
  assert.equal(invalid.statusCode, 400)

  const duplicate = await app.inject({
    method: 'POST',
    url: `/api/tables/${tableId}/judges`,
    payload: { email: judge.email.toUpperCase() },
    cookies: ownerCookies,
  })
  assert.equal(duplicate.statusCode, 200)
  assert.equal(JSON.parse(duplicate.payload).created, false)

  const nonOwnerInvite = await app.inject({
    method: 'POST',
    url: `/api/tables/${tableId}/judges`,
    payload: { email: 'x@example.com' },
    cookies: outsiderCookies,
  })
  assert.equal(nonOwnerInvite.statusCode, 403)
})

test('deleting a table is owner-only', async () => {
  const byJudge = await app.inject({
    method: 'DELETE',
    url: `/api/tables/${tableToDeleteId}`,
    cookies: judgeCookies,
  })
  assert.equal(byJudge.statusCode, 403)

  const stillThere = await app.inject({ method: 'GET', url: `/api/tables/${tableToDeleteId}` })
  assert.equal(stillThere.statusCode, 200)

  const byOwner = await app.inject({
    method: 'DELETE',
    url: `/api/tables/${tableToDeleteId}`,
    cookies: ownerCookies,
  })
  assert.equal(byOwner.statusCode, 200)

  const gone = await app.inject({ method: 'GET', url: `/api/tables/${tableToDeleteId}` })
  assert.equal(gone.statusCode, 404)
})

test('CORS reflects the request origin and allows credentials', async () => {
  const res = await app.inject({
    method: 'GET',
    url: '/api/auth/me',
    headers: { origin: 'http://localhost:3000' },
  })
  assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:3000')
  assert.equal(res.headers['access-control-allow-credentials'], 'true')
})

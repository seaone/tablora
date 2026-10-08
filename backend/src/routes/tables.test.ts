import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { eq } from 'drizzle-orm'
import { buildApp } from '../app.js'
import { db } from '../db/index.js'
import { tables, users, type User } from '../db/schema.js'
import { createTestUser, sessionCookies } from '../test-utils/auth.js'

let app: ReturnType<typeof buildApp>
let user: User
let cookies: Record<string, string>
let tableId: string

before(async () => {
  app = buildApp()
  user = await createTestUser()
  cookies = await sessionCookies(app, user)

  const created = await app.inject({
    method: 'POST',
    url: '/api/tables',
    payload: {
      title: 'Тестовая таблица',
      columns: [{ name: 'Баллы', type: 'number' }],
      participants: [{ name: 'Участник' }],
    },
    cookies,
  })
  tableId = JSON.parse(created.payload).id
})

after(async () => {
  await db.delete(tables).where(eq(tables.id, tableId))
  await db.delete(users).where(eq(users.id, user.id))
  await app.close()
})

test('POST /api/tables returns 400 when title is missing or empty', async () => {
  const res1 = await app.inject({
    method: 'POST',
    url: '/api/tables',
    payload: {},
    cookies,
  })
  assert.equal(res1.statusCode, 400)

  const res2 = await app.inject({
    method: 'POST',
    url: '/api/tables',
    payload: { title: '   ' },
    cookies,
  })
  assert.equal(res2.statusCode, 400)
})

test('POST /api/tables returns 400 when columns is missing', async () => {
  const res = await app.inject({
    method: 'POST',
    url: '/api/tables',
    payload: { title: 'Тест', participants: [] },
    cookies,
  })
  assert.equal(res.statusCode, 400)
})

test('POST /api/tables returns 400 when participants is missing', async () => {
  const res = await app.inject({
    method: 'POST',
    url: '/api/tables',
    payload: { title: 'Тест', columns: [] },
    cookies,
  })
  assert.equal(res.statusCode, 400)
})

test('POST /api/tables/:id/participants returns 400 when name is missing', async () => {
  const res = await app.inject({
    method: 'POST',
    url: `/api/tables/${tableId}/participants`,
    payload: { name: '' },
    cookies,
  })
  assert.equal(res.statusCode, 400)
})

test('POST /api/tables/:id/columns returns 400 when name is missing', async () => {
  const res = await app.inject({
    method: 'POST',
    url: `/api/tables/${tableId}/columns`,
    payload: { name: '' },
    cookies,
  })
  assert.equal(res.statusCode, 400)
})

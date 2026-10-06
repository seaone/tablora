import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildApp } from '../app.js'

test('POST /api/tables returns 400 when title is missing or empty', async () => {
  const app = buildApp()

  const res1 = await app.inject({
    method: 'POST',
    url: '/api/tables',
    payload: {},
  })
  assert.equal(res1.statusCode, 400)

  const res2 = await app.inject({
    method: 'POST',
    url: '/api/tables',
    payload: { title: '   ' },
  })
  assert.equal(res2.statusCode, 400)

  await app.close()
})

test('POST /api/tables returns 400 when columns is missing', async () => {
  const app = buildApp()

  const res = await app.inject({
    method: 'POST',
    url: '/api/tables',
    payload: { title: 'Тест', participants: [] },
  })
  assert.equal(res.statusCode, 400)

  await app.close()
})

test('POST /api/tables returns 400 when participants is missing', async () => {
  const app = buildApp()

  const res = await app.inject({
    method: 'POST',
    url: '/api/tables',
    payload: { title: 'Тест', columns: [] },
  })
  assert.equal(res.statusCode, 400)

  await app.close()
})

test('POST /api/tables/:id/participants returns 400 when name is missing', async () => {
  const app = buildApp()

  const res = await app.inject({
    method: 'POST',
    url: '/api/tables/fake-id/participants',
    payload: { name: '' },
  })
  assert.equal(res.statusCode, 400)

  await app.close()
})

test('POST /api/tables/:id/columns returns 400 when name is missing', async () => {
  const app = buildApp()

  const res = await app.inject({
    method: 'POST',
    url: '/api/tables/fake-id/columns',
    payload: { name: '' },
  })
  assert.equal(res.statusCode, 400)

  await app.close()
})


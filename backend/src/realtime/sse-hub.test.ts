import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SSE_EVENTS } from '@tablora/shared'
import { sseHub } from './sse-hub.js'
import type { FastifyReply } from 'fastify'

test('SSEHub keeps a backed-up client and sends the latest update on drain', () => {
  const tableId = 'slow-table-123'
  const messages: string[] = []
  const drainCallbacks: Array<() => void> = []
  let blocked = true
  let ended = false

  const mockReply = {
    raw: {
      writeHead: () => {},
      write: (data: string) => {
        messages.push(data)
        return !blocked
      },
      once: (event: string, callback: () => void) => {
        if (event === 'drain') drainCallbacks.push(callback)
      },
      on: () => {},
      end: () => {
        ended = true
      },
    },
  } as unknown as FastifyReply

  const client = sseHub.subscribe(tableId, mockReply)
  sseHub.broadcast(tableId, SSE_EVENTS.tableUpdated, { n: 1 })
  sseHub.broadcast(tableId, SSE_EVENTS.tableUpdated, { n: 2 })

  assert.equal(sseHub.getClientCount(tableId), 1)
  assert.equal(ended, false)

  blocked = false
  for (const callback of drainCallbacks) callback()

  assert.ok(messages.some((message) => message.includes('"n":2')))
  sseHub.unsubscribe(tableId, client)
})

test('SSEHub subscribes and broadcasts events to clients', async () => {
  const tableId = 'test-table-123'
  const messages: string[] = []

  const mockReply = {
    raw: {
      writeHead: () => {},
      write: (data: string) => {
        messages.push(data);
        return true;
      },
      on: () => {},
      end: () => {},
    },
  } as unknown as FastifyReply

  const client = sseHub.subscribe(tableId, mockReply)
  assert.equal(sseHub.getClientCount(tableId), 1)

  // Initial handshake should be sent
  assert.ok(messages.some((m) => m.includes('event: connected')))

  // Broadcast event
  sseHub.broadcast(tableId, SSE_EVENTS.tableUpdated, { foo: 'bar' })
  assert.ok(messages.some((m) => m.includes('event: table_updated') && m.includes('"foo":"bar"')))

  // Unsubscribe
  sseHub.unsubscribe(tableId, client)
  assert.equal(sseHub.getClientCount(tableId), 0)
})


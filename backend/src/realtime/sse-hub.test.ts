import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SSE_EVENTS } from '@tablora/shared'
import { sseHub } from './sse-hub.js'
import type { FastifyReply } from 'fastify'

test('SSEHub subscribes and broadcasts events to clients', async () => {
  const tableId = 'test-table-123'
  const messages: string[] = []

  const mockReply = {
    raw: {
      writeHead: () => {},
      write: (data: string) => {
        messages.push(data)
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


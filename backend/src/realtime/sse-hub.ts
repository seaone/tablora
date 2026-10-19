import type { FastifyReply } from 'fastify'
import { SSE_EVENTS, type SSEEventName } from '@tablora/shared'

interface SSEClient {
  id: string
  reply: FastifyReply
  busy: boolean
  pending: string | null
}

// One slot per open spectator page; 500 covers a large hall while still bounding memory.
const MAX_CLIENTS_PER_TABLE = 500

class SSEHub {
  // shortcut: live subscriptions are per process; a second backend replica needs a shared bus.
  private tables: Map<string, Set<SSEClient>> = new Map()
  private pingInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startPing()
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      for (const [tableId, clients] of this.tables.entries()) {
        for (const client of clients) {
          this.writeTo(tableId, client, ': ping\n\n', false)
        }
      }
    }, 20000)
    if (this.pingInterval.unref) {
      this.pingInterval.unref()
    }
  }

  /**
   * Writes to one client without ending a healthy but backed-up socket.
   * shortcut: keep only the latest payload while a client is backed up;
   * upgrade to a queue if intermediate updates must not be coalesced.
   */
  public writeTo(tableId: string, client: SSEClient, payload: string, queue = true) {
    if (client.busy) {
      if (queue) client.pending = payload
      return
    }

    try {
      if (client.reply.raw.write(payload)) return

      client.busy = true
      client.pending = null
      client.reply.raw.once('drain', () => {
        client.busy = false
        const next = client.pending
        client.pending = null
        if (next && this.tables.get(tableId)?.has(client)) {
          this.writeTo(tableId, client, next)
        }
      })
    } catch {
      this.unsubscribe(tableId, client)
    }
  }

  public subscribe(tableId: string, reply: FastifyReply, corsOrigin = '*'): SSEClient {
    // Write SSE headers directly to raw response
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': corsOrigin,
      // A reflecting origin (not '*') is required when the client sends credentials.
      ...(corsOrigin !== '*' ? { 'Access-Control-Allow-Credentials': 'true' } : {}),
    })

    const client: SSEClient = {
      id: Math.random().toString(36).substring(2, 10),
      reply,
      busy: false,
      pending: null,
    }

    if (!this.tables.has(tableId)) {
      this.tables.set(tableId, new Set())
    }
    this.tables.get(tableId)!.add(client)

    // Handshake. Goes through writeTo so a backed-up client is tracked.
    this.writeTo(tableId, client, `event: ${SSE_EVENTS.connected}\ndata: ${JSON.stringify({ tableId, clientId: client.id })}\n\n`)

    reply.raw.on('close', () => {
      this.unsubscribe(tableId, client)
    })

    return client
  }

  public unsubscribe(tableId: string, client: SSEClient) {
    const clients = this.tables.get(tableId)
    if (clients) {
      clients.delete(client)
      if (clients.size === 0) {
        this.tables.delete(tableId)
      }
    }
  }

  public broadcast(tableId: string, event: SSEEventName, data: unknown) {
    const clients = this.tables.get(tableId)
    if (!clients || clients.size === 0) return

    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    for (const client of clients) {
      this.writeTo(tableId, client, payload)
    }
  }

  /** Ends every stream for a table, e.g. after it has been deleted. */
  public closeTable(tableId: string) {
    const clients = this.tables.get(tableId)
    if (!clients) return
    for (const client of clients) {
      try {
        client.reply.raw.end()
      } catch {
        // ignore
      }
    }
    this.tables.delete(tableId)
  }

  public getClientCount(tableId: string): number {
    return this.tables.get(tableId)?.size ?? 0
  }

  /** True when a table already has the maximum number of live streams. */
  public isFull(tableId: string): boolean {
    return this.getClientCount(tableId) >= MAX_CLIENTS_PER_TABLE
  }

  public destroy() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
    }
    for (const [, clients] of this.tables.entries()) {
      for (const client of clients) {
        try {
          client.reply.raw.end()
        } catch {
          // ignore
        }
      }
    }
    this.tables.clear()
  }
}

export const sseHub = new SSEHub()


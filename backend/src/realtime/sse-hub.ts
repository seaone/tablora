import type { FastifyReply } from 'fastify'
import { SSE_EVENTS, type SSEEventName } from '@tablora/shared'

interface SSEClient {
  id: string
  reply: FastifyReply
}

class SSEHub {
  private tables: Map<string, Set<SSEClient>> = new Map()
  private pingInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startPing()
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      for (const [tableId, clients] of this.tables.entries()) {
        for (const client of clients) {
          try {
            client.reply.raw.write(': ping\n\n')
          } catch (err) {
            this.unsubscribe(tableId, client)
          }
        }
      }
    }, 20000)
    if (this.pingInterval.unref) {
      this.pingInterval.unref()
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
    }

    if (!this.tables.has(tableId)) {
      this.tables.set(tableId, new Set())
    }
    this.tables.get(tableId)!.add(client)

    // Handshake
    client.reply.raw.write(`event: ${SSE_EVENTS.connected}\ndata: ${JSON.stringify({ tableId, clientId: client.id })}\n\n`)

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
      try {
        client.reply.raw.write(payload)
      } catch (err) {
        this.unsubscribe(tableId, client)
      }
    }
  }

  public getClientCount(tableId: string): number {
    return this.tables.get(tableId)?.size ?? 0
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


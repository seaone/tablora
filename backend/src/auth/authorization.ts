import { and, eq } from 'drizzle-orm'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { db } from '../db/index.js'
import { tableJudges, tables } from '../db/schema.js'
import type { TableAccess } from './types.js'

interface SessionUser {
  id: string
  email: string
}

/**
 * Resolves a caller's relationship to a table. Returns null when the table does
 * not exist, so callers can answer with a not-found response.
 */
export async function getTableAccess(
  tableId: string,
  user: SessionUser | null,
): Promise<TableAccess | null> {
  const [table] = await db.select().from(tables).where(eq(tables.id, tableId))
  if (!table) return null

  if (user && table.ownerId && table.ownerId === user.id) {
    return { role: 'owner', ownerId: table.ownerId }
  }

  if (user) {
    const [judge] = await db
      .select()
      .from(tableJudges)
      .where(
        and(eq(tableJudges.tableId, tableId), eq(tableJudges.email, user.email.toLowerCase())),
      )
    if (judge) return { role: 'judge', ownerId: table.ownerId }
  }

  return { role: 'viewer', ownerId: table.ownerId }
}

/** Rejects anonymous requests. Used by routes that only need a signed-in user. */
export async function requireUser(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (!request.authUser) {
    await reply.code(401).send({ error: 'Unauthorized' })
  }
}

/** Allows the table's owner or an authorized judge; rejects everyone else. */
export async function requireTableMutator(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id: tableId } = request.params as { id: string }
  const access = await getTableAccess(tableId, request.authUser)

  if (!access) {
    await reply.notFound('Table not found')
    return
  }
  if (!request.authUser) {
    await reply.code(401).send({ error: 'Unauthorized' })
    return
  }
  if (access.role !== 'owner' && access.role !== 'judge') {
    await reply.code(403).send({ error: 'Forbidden' })
    return
  }

  request.tableAccess = access
}

/** Allows only the table's owner; rejects everyone else. */
export async function requireTableOwner(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id: tableId } = request.params as { id: string }
  const access = await getTableAccess(tableId, request.authUser)

  if (!access) {
    await reply.notFound('Table not found')
    return
  }
  if (!request.authUser) {
    await reply.code(401).send({ error: 'Unauthorized' })
    return
  }
  if (access.role !== 'owner') {
    await reply.code(403).send({ error: 'Forbidden' })
    return
  }

  request.tableAccess = access
}

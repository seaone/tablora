import type { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { eq, asc, and, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { COLUMN_TYPES, SSE_EVENTS, type ColumnType, type TableAccessRole } from '@tablora/shared'
import { db } from '../db/index.js'
import { tables, columns, participants, scores, tableJudges } from '../db/schema.js'
import { sseHub } from '../realtime/sse-hub.js'
import { getTableAccess, requireTableMutator, requireTableOwner, requireUser } from '../auth/authorization.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const email = value.trim().toLowerCase()
  return email.length <= 255 && EMAIL_PATTERN.test(email) ? email : null
}

function isColumnType(value: unknown): value is ColumnType {
  return typeof value === 'string' && (COLUMN_TYPES as readonly string[]).includes(value)
}

function isColumnInput(value: unknown): value is { name: string; type: ColumnType } {
  if (!value || typeof value !== 'object') return false
  const column = value as { name?: unknown; type?: unknown }
  return (
    typeof column.name === 'string' &&
    column.name.trim().length <= 100 &&
    isColumnType(column.type)
  )
}

function isParticipantInput(value: unknown): value is { name: string; description?: string } {
  if (!value || typeof value !== 'object') return false
  const participant = value as { name?: unknown; description?: unknown }
  return (
    typeof participant.name === 'string' &&
    participant.name.trim().length <= 200 &&
    (participant.description === undefined || typeof participant.description === 'string')
  )
}

function corsOriginFor(request: FastifyRequest): string {
  return request.headers.origin ?? '*'
}

export async function getFullTable(tableId: string) {
  const [table] = await db.select().from(tables).where(eq(tables.id, tableId))
  if (!table) return null

  const [tableColumns, tableParticipants, tableScores] = await Promise.all([
    db
      .select()
      .from(columns)
      .where(eq(columns.tableId, tableId))
      .orderBy(asc(columns.sortOrder), asc(columns.createdAt), asc(columns.id)),
    db
      .select()
      .from(participants)
      .where(eq(participants.tableId, tableId))
      .orderBy(asc(participants.sortOrder), asc(participants.createdAt), asc(participants.id)),
    db.select().from(scores).where(eq(scores.tableId, tableId)),
  ])

  return {
    ...table,
    columns: tableColumns,
    participants: tableParticipants,
    scores: tableScores,
  }
}

/** A table as it appears in a user's directory, labeled with that user's role. */
export interface MyTableSummary {
  id: string
  title: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  role: Extract<TableAccessRole, 'owner' | 'judge'>
}

function toMyTableSummary(
  table: typeof tables.$inferSelect,
  role: MyTableSummary['role'],
): MyTableSummary {
  return {
    id: table.id,
    title: table.title,
    description: table.description,
    createdAt: table.createdAt,
    updatedAt: table.updatedAt,
    role,
  }
}

/**
 * Returns the tables a user owns plus the tables they are authorized to judge,
 * merged by table id with owner taking precedence, most recently updated first.
 */
export async function listTablesForUser(user: {
  id: string
  email: string
}): Promise<MyTableSummary[]> {
  const owned = await db.select().from(tables).where(eq(tables.ownerId, user.id))

  const judged = await db
    .select({ table: tables })
    .from(tableJudges)
    .innerJoin(tables, eq(tableJudges.tableId, tables.id))
    .where(eq(tableJudges.email, user.email.toLowerCase()))

  const byId = new Map<string, MyTableSummary>()
  for (const { table } of judged) {
    byId.set(table.id, toMyTableSummary(table, 'judge'))
  }
  // Owner precedence: a table the caller both owns and judges appears once as owner.
  for (const table of owned) {
    byId.set(table.id, toMyTableSummary(table, 'owner'))
  }

  return [...byId.values()].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
}

export const tableRoutes: FastifyPluginAsync = async (fastify) => {
  // Create table (authenticated organizers only; the creator becomes the owner)
  fastify.post('/api/tables', { preHandler: requireUser }, async (request, reply) => {
    const body = request.body as {
      title?: string
      description?: string
      columns?: Array<{ name: string; type: ColumnType }>
      participants?: Array<{ name: string; description?: string }>
    }

    if (!body?.title || typeof body.title !== 'string' || !body.title.trim()) {
      return reply.badRequest('Table title is required')
    }

    const title = body.title.trim()
    if (title.length > 255) {
      return reply.badRequest('Table title is too long')
    }

    if (body.description !== undefined && typeof body.description !== 'string') {
      return reply.badRequest('Table description must be a string')
    }

    if (!Array.isArray(body.columns)) {
      return reply.badRequest('Table columns are required')
    }

    if (!Array.isArray(body.participants)) {
      return reply.badRequest('Table participants are required')
    }

    const inputColumns = body.columns
    const inputParticipants = body.participants

    if (!inputColumns.every(isColumnInput)) {
      return reply.badRequest('Each column needs a name and a supported type')
    }

    if (!inputParticipants.every(isParticipantInput)) {
      return reply.badRequest('Each participant needs a name')
    }

    const tableId = nanoid(10)
    const now = new Date()

    await db.transaction(async (tx) => {
      await tx.insert(tables).values({
        id: tableId,
        title,
        description: body.description?.trim() || null,
        ownerId: request.authUser!.id,
        createdAt: now,
        updatedAt: now,
      })

      for (let i = 0; i < inputColumns.length; i++) {
        const col = inputColumns[i]
        await tx.insert(columns).values({
          id: nanoid(10),
          tableId,
          name: col.name.trim() || `Колонка ${i + 1}`,
          type: col.type,
          sortOrder: i,
          createdAt: now,
        })
      }

      for (let i = 0; i < inputParticipants.length; i++) {
        const p = inputParticipants[i]
        if (p.name.trim()) {
          await tx.insert(participants).values({
            id: nanoid(10),
            tableId,
            name: p.name.trim(),
            description: p.description?.trim() || null,
            sortOrder: i,
            createdAt: now,
          })
        }
      }
    })

    const fullTable = await getFullTable(tableId)
    return reply.status(201).send(fullTable)
  })

  // List the caller's tables (owned or judged; authenticated)
  fastify.get('/api/tables', { preHandler: requireUser }, async (request) => {
    const tables = await listTablesForUser(request.authUser!)
    return { tables }
  })

  // Get full table (public: spectators view anonymously)
  fastify.get('/api/tables/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const fullTable = await getFullTable(id)
    if (!fullTable) {
      return reply.notFound('Table not found')
    }
    return fullTable
  })

  // The caller's role for a table (public: used by the judge page to decide access)
  fastify.get('/api/tables/:id/access', async (request, reply) => {
    const { id } = request.params as { id: string }
    const access = await getTableAccess(id, request.authUser)
    if (!access) {
      return reply.notFound('Table not found')
    }
    return { role: access.role }
  })

  // SSE subscription endpoint (public)
  fastify.get('/api/tables/:id/events', async (request, reply) => {
    const { id } = request.params as { id: string }
    const fullTable = await getFullTable(id)
    if (!fullTable) {
      return reply.notFound('Table not found')
    }

    if (sseHub.isFull(id)) {
      return reply.code(503).send({ error: 'Too many connections for this table' })
    }

    // We own the raw response from here; Fastify must not end it.
    reply.hijack()

    const client = sseHub.subscribe(id, reply, corsOriginFor(request))
    // Send initial snapshot through the hub so backpressure is tracked.
    sseHub.writeTo(id, client, `event: ${SSE_EVENTS.tableSnapshot}\ndata: ${JSON.stringify(fullTable)}\n\n`)
  })

  // Add participant (owner or authorized judge)
  fastify.post(
    '/api/tables/:id/participants',
    { preHandler: requireTableMutator },
    async (request, reply) => {
      const { id: tableId } = request.params as { id: string }
      const body = request.body as { name?: string; description?: string }

      if (!body?.name || typeof body.name !== 'string' || !body.name.trim()) {
        return reply.badRequest('Participant name is required')
      }

      const name = body.name.trim()
      if (name.length > 200) {
        return reply.badRequest('Participant name is too long')
      }
      if (body.description !== undefined && typeof body.description !== 'string') {
        return reply.badRequest('Participant description must be a string')
      }

      const currentParticipants = await db
        .select()
        .from(participants)
        .where(eq(participants.tableId, tableId))

      const newId = nanoid(10)
      const now = new Date()
      const nextSortOrder =
        currentParticipants.reduce((max, participant) => Math.max(max, participant.sortOrder), -1) + 1
      const [newParticipant] = await db
        .insert(participants)
        .values({
          id: newId,
          tableId,
          name,
          description: body.description?.trim() || null,
          sortOrder: nextSortOrder,
          createdAt: now,
        })
        .returning()

      await db.update(tables).set({ updatedAt: sql`now()` }).where(eq(tables.id, tableId))

      const fullTable = await getFullTable(tableId)
      sseHub.broadcast(tableId, SSE_EVENTS.tableUpdated, fullTable)

      return reply.status(201).send(newParticipant)
    },
  )

  // Update participant (owner or authorized judge)
  fastify.put(
    '/api/tables/:id/participants/:participantId',
    { preHandler: requireTableMutator },
    async (request, reply) => {
      const { id: tableId, participantId } = request.params as { id: string; participantId: string }
      const body = request.body as { name?: string; description?: string }

      if (!body?.name || typeof body.name !== 'string' || !body.name.trim()) {
        return reply.badRequest('Participant name is required')
      }

      const name = body.name.trim()
      if (name.length > 200) {
        return reply.badRequest('Participant name is too long')
      }
      if (body.description !== undefined && typeof body.description !== 'string') {
        return reply.badRequest('Participant description must be a string')
      }

      const [participant] = await db
        .select()
        .from(participants)
        .where(eq(participants.id, participantId))

      if (!participant || participant.tableId !== tableId) {
        return reply.notFound('Participant not found')
      }

      const [updatedParticipant] = await db
        .update(participants)
        .set({
          name,
          description: body.description?.trim() || null,
        })
        .where(eq(participants.id, participantId))
        .returning()

      await db.update(tables).set({ updatedAt: sql`now()` }).where(eq(tables.id, tableId))

      const fullTable = await getFullTable(tableId)
      sseHub.broadcast(tableId, SSE_EVENTS.tableUpdated, fullTable)

      return reply.send(updatedParticipant)
    },
  )

  // Add column (owner or authorized judge)
  fastify.post(
    '/api/tables/:id/columns',
    { preHandler: requireTableMutator },
    async (request, reply) => {
      const { id: tableId } = request.params as { id: string }
      const body = request.body as { name?: string; type?: ColumnType }

      if (!body?.name || typeof body.name !== 'string' || !body.name.trim()) {
        return reply.badRequest('Column name is required')
      }

      const name = body.name.trim()
      if (name.length > 100) {
        return reply.badRequest('Column name is too long')
      }
      if (!isColumnType(body.type)) {
        return reply.badRequest('Column type must be number, text, or time')
      }

      const currentCols = await db
        .select()
        .from(columns)
        .where(eq(columns.tableId, tableId))

      const newId = nanoid(10)
      const now = new Date()
      const nextSortOrder =
        currentCols.reduce((max, column) => Math.max(max, column.sortOrder), -1) + 1
      const [newCol] = await db
        .insert(columns)
        .values({
          id: newId,
          tableId,
          name,
          type: body.type,
          sortOrder: nextSortOrder,
          createdAt: now,
        })
        .returning()

      await db.update(tables).set({ updatedAt: sql`now()` }).where(eq(tables.id, tableId))

      const fullTable = await getFullTable(tableId)
      sseHub.broadcast(tableId, SSE_EVENTS.tableUpdated, fullTable)

      return reply.status(201).send(newCol)
    },
  )

  // Update column (owner or authorized judge)
  fastify.put(
    '/api/tables/:id/columns/:columnId',
    { preHandler: requireTableMutator },
    async (request, reply) => {
      const { id: tableId, columnId } = request.params as { id: string; columnId: string }
      const body = request.body as { name?: string; type?: ColumnType }

      if (!body?.name || typeof body.name !== 'string' || !body.name.trim()) {
        return reply.badRequest('Column name is required')
      }

      const name = body.name.trim()
      if (name.length > 100) {
        return reply.badRequest('Column name is too long')
      }
      if (body.type !== undefined && !isColumnType(body.type)) {
        return reply.badRequest('Column type must be number, text, or time')
      }

      const [column] = await db
        .select()
        .from(columns)
        .where(eq(columns.id, columnId))

      if (!column || column.tableId !== tableId) {
        return reply.notFound('Column not found')
      }

      const [updatedCol] = await db
        .update(columns)
        .set({
          name,
          type: body.type || column.type,
        })
        .where(eq(columns.id, columnId))
        .returning()

      await db.update(tables).set({ updatedAt: sql`now()` }).where(eq(tables.id, tableId))

      const fullTable = await getFullTable(tableId)
      sseHub.broadcast(tableId, SSE_EVENTS.tableUpdated, fullTable)

      return reply.send(updatedCol)
    },
  )

  // Update participant scores (owner or authorized judge)
  fastify.put(
    '/api/tables/:id/participants/:participantId/scores',
    { preHandler: requireTableMutator },
    async (request, reply) => {
      const { id: tableId, participantId } = request.params as { id: string; participantId: string }
      const body = request.body as { scores?: Record<string, string | number> }

      const [participant] = await db
        .select()
        .from(participants)
        .where(eq(participants.id, participantId))

      if (!participant || participant.tableId !== tableId) {
        return reply.notFound('Participant not found')
      }

      if (!body?.scores || typeof body.scores !== 'object' || Array.isArray(body.scores)) {
        return reply.badRequest('A scores object is required')
      }

      const entries = Object.entries(body.scores)
      if (entries.some(([, value]) => typeof value !== 'string' && !Number.isFinite(value))) {
        return reply.badRequest('Score values must be strings or finite numbers')
      }

      const tableColumns = await db
        .select({ id: columns.id })
        .from(columns)
        .where(eq(columns.tableId, tableId))
      const columnIds = new Set(tableColumns.map((column) => column.id))

      if (entries.some(([columnId]) => !columnIds.has(columnId))) {
        return reply.badRequest('Score column does not belong to this table')
      }

      const now = new Date()

      await db.transaction(async (tx) => {
        for (const [columnId, rawValue] of entries) {
          const value = String(rawValue).trim()
          await tx
            .insert(scores)
            .values({ id: nanoid(10), tableId, participantId, columnId, value, updatedAt: now })
            .onConflictDoUpdate({
              target: [scores.participantId, scores.columnId],
              set: { value, updatedAt: now },
            })
        }

        await tx.update(tables).set({ updatedAt: sql`now()` }).where(eq(tables.id, tableId))
      })

      const fullTable = await getFullTable(tableId)
      sseHub.broadcast(tableId, SSE_EVENTS.tableUpdated, fullTable)

      return reply.send({ success: true, table: fullTable })
    },
  )

  // Delete participant (owner or authorized judge)
  fastify.delete(
    '/api/tables/:id/participants/:participantId',
    { preHandler: requireTableMutator },
    async (request, reply) => {
      const { id: tableId, participantId } = request.params as { id: string; participantId: string }

      const [deleted] = await db
        .delete(participants)
        .where(and(eq(participants.id, participantId), eq(participants.tableId, tableId)))
        .returning({ id: participants.id })

      if (!deleted) {
        return reply.notFound('Participant not found')
      }

      await db.update(tables).set({ updatedAt: sql`now()` }).where(eq(tables.id, tableId))

      const fullTable = await getFullTable(tableId)
      if (fullTable) {
        sseHub.broadcast(tableId, SSE_EVENTS.tableUpdated, fullTable)
      }

      return reply.send({ success: true })
    },
  )

  // Delete column (owner or authorized judge)
  fastify.delete(
    '/api/tables/:id/columns/:columnId',
    { preHandler: requireTableMutator },
    async (request, reply) => {
      const { id: tableId, columnId } = request.params as { id: string; columnId: string }

      const [deleted] = await db
        .delete(columns)
        .where(and(eq(columns.id, columnId), eq(columns.tableId, tableId)))
        .returning({ id: columns.id })

      if (!deleted) {
        return reply.notFound('Column not found')
      }

      await db.update(tables).set({ updatedAt: sql`now()` }).where(eq(tables.id, tableId))

      const fullTable = await getFullTable(tableId)
      if (fullTable) {
        sseHub.broadcast(tableId, SSE_EVENTS.tableUpdated, fullTable)
      }

      return reply.send({ success: true })
    },
  )

  // List authorized judges (owner only)
  fastify.get(
    '/api/tables/:id/judges',
    { preHandler: requireTableOwner },
    async (request) => {
      const { id: tableId } = request.params as { id: string }
      const judges = await db
        .select()
        .from(tableJudges)
        .where(eq(tableJudges.tableId, tableId))
        .orderBy(asc(tableJudges.createdAt))
      return { judges }
    },
  )

  // Invite a judge by email (owner only; idempotent)
  fastify.post(
    '/api/tables/:id/judges',
    { preHandler: requireTableOwner },
    async (request, reply) => {
      const { id: tableId } = request.params as { id: string }
      const body = request.body as { email?: string }
      const email = normalizeEmail(body?.email)

      if (!email) {
        return reply.badRequest('A valid email is required')
      }

      const [created] = await db
        .insert(tableJudges)
        .values({ id: nanoid(10), tableId, email, createdAt: new Date() })
        .onConflictDoNothing()
        .returning()

      if (created) {
        return reply.status(201).send({ judge: created, created: true })
      }

      const [existing] = await db
        .select()
        .from(tableJudges)
        .where(and(eq(tableJudges.tableId, tableId), eq(tableJudges.email, email)))

      if (!existing) {
        return reply.code(409).send({ error: 'Judge was removed concurrently' })
      }

      return reply.status(200).send({ judge: existing, created: false })
    },
  )

  // Remove an authorized judge (owner only)
  fastify.delete(
    '/api/tables/:id/judges/:judgeId',
    { preHandler: requireTableOwner },
    async (request, reply) => {
      const { id: tableId, judgeId } = request.params as { id: string; judgeId: string }

      const [judge] = await db
        .select()
        .from(tableJudges)
        .where(eq(tableJudges.id, judgeId))

      if (!judge || judge.tableId !== tableId) {
        return reply.notFound('Judge not found')
      }

      await db.delete(tableJudges).where(eq(tableJudges.id, judgeId))
      return reply.send({ success: true })
    },
  )

  // Delete table (owner only)
  fastify.delete(
    '/api/tables/:id',
    { preHandler: requireTableOwner },
    async (request, reply) => {
      const { id: tableId } = request.params as { id: string }

      await db
        .delete(tables)
        .where(eq(tables.id, tableId))

      sseHub.broadcast(tableId, SSE_EVENTS.tableDeleted, { tableId })
      sseHub.closeTable(tableId)

      return reply.send({ success: true })
    },
  )
}

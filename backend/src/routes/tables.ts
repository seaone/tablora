import type { FastifyPluginAsync } from 'fastify'
import { eq, asc } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { SSE_EVENTS, type ColumnType } from '@tablora/shared'
import { db } from '../db/index.js'
import { tables, columns, participants, scores } from '../db/schema.js'
import { sseHub } from '../realtime/sse-hub.js'

export async function getFullTable(tableId: string) {
  const [table] = await db.select().from(tables).where(eq(tables.id, tableId))
  if (!table) return null

  const tableColumns = await db
    .select()
    .from(columns)
    .where(eq(columns.tableId, tableId))
    .orderBy(asc(columns.sortOrder), asc(columns.createdAt))

  const tableParticipants = await db
    .select()
    .from(participants)
    .where(eq(participants.tableId, tableId))
    .orderBy(asc(participants.sortOrder), asc(participants.createdAt))

  const tableScores = await db
    .select()
    .from(scores)
    .where(eq(scores.tableId, tableId))

  return {
    ...table,
    columns: tableColumns,
    participants: tableParticipants,
    scores: tableScores,
  }
}

export const tableRoutes: FastifyPluginAsync = async (fastify) => {
  // Create table
  fastify.post('/api/tables', async (request, reply) => {
    const body = request.body as {
      title?: string
      description?: string
      columns?: Array<{ name: string; type: ColumnType }>
      participants?: Array<{ name: string; description?: string }>
    }

    if (!body?.title || typeof body.title !== 'string' || !body.title.trim()) {
      return reply.badRequest('Table title is required')
    }

    if (!Array.isArray(body.columns)) {
      return reply.badRequest('Table columns are required')
    }

    if (!Array.isArray(body.participants)) {
      return reply.badRequest('Table participants are required')
    }

    const tableId = nanoid(10)
    const now = new Date()

    await db.insert(tables).values({
      id: tableId,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      createdAt: now,
      updatedAt: now,
    })

    for (let i = 0; i < body.columns.length; i++) {
      const col = body.columns[i]
      await db.insert(columns).values({
        id: nanoid(10),
        tableId,
        name: col.name.trim() || `Колонка ${i + 1}`,
        type: col.type || 'number',
        sortOrder: i,
        createdAt: now,
      })
    }

    for (let i = 0; i < body.participants.length; i++) {
      const p = body.participants[i]
      if (p.name && p.name.trim()) {
        await db.insert(participants).values({
          id: nanoid(10),
          tableId,
          name: p.name.trim(),
          description: p.description?.trim() || null,
          sortOrder: i,
          createdAt: now,
        })
      }
    }

    const fullTable = await getFullTable(tableId)
    return reply.status(201).send(fullTable)
  })

  // Get full table
  fastify.get('/api/tables/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const fullTable = await getFullTable(id)
    if (!fullTable) {
      return reply.notFound('Table not found')
    }
    return fullTable
  })

  // SSE subscription endpoint
  fastify.get('/api/tables/:id/events', async (request, reply) => {
    const { id } = request.params as { id: string }
    const fullTable = await getFullTable(id)
    if (!fullTable) {
      return reply.notFound('Table not found')
    }

    const client = sseHub.subscribe(id, reply)
    // Send initial snapshot
    client.reply.raw.write(`event: ${SSE_EVENTS.tableSnapshot}\ndata: ${JSON.stringify(fullTable)}\n\n`)

    // Keep open (Fastify shouldn't end reply)
    await new Promise(() => {})
  })

  // Add participant
  fastify.post('/api/tables/:id/participants', async (request, reply) => {
    const { id: tableId } = request.params as { id: string }
    const body = request.body as { name?: string; description?: string }

    if (!body?.name || typeof body.name !== 'string' || !body.name.trim()) {
      return reply.badRequest('Participant name is required')
    }

    const table = await db.select().from(tables).where(eq(tables.id, tableId))
    if (!table.length) {
      return reply.notFound('Table not found')
    }

    const currentParticipants = await db
      .select()
      .from(participants)
      .where(eq(participants.tableId, tableId))

    const newId = nanoid(10)
    const [newParticipant] = await db
      .insert(participants)
      .values({
        id: newId,
        tableId,
        name: body.name.trim(),
        description: body.description?.trim() || null,
        sortOrder: currentParticipants.length,
        createdAt: new Date(),
      })
      .returning()

    const fullTable = await getFullTable(tableId)
    sseHub.broadcast(tableId, SSE_EVENTS.tableUpdated, fullTable)

    return reply.status(201).send(newParticipant)
  })

  // Update participant
  fastify.put('/api/tables/:id/participants/:participantId', async (request, reply) => {
    const { id: tableId, participantId } = request.params as { id: string; participantId: string }
    const body = request.body as { name?: string; description?: string }

    if (!body?.name || typeof body.name !== 'string' || !body.name.trim()) {
      return reply.badRequest('Participant name is required')
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
        name: body.name.trim(),
        description: body.description?.trim() || null,
      })
      .where(eq(participants.id, participantId))
      .returning()

    await db.update(tables).set({ updatedAt: new Date() }).where(eq(tables.id, tableId))

    const fullTable = await getFullTable(tableId)
    sseHub.broadcast(tableId, SSE_EVENTS.tableUpdated, fullTable)

    return reply.send(updatedParticipant)
  })

  // Add column
  fastify.post('/api/tables/:id/columns', async (request, reply) => {
    const { id: tableId } = request.params as { id: string }
    const body = request.body as { name?: string; type?: ColumnType }

    if (!body?.name || typeof body.name !== 'string' || !body.name.trim()) {
      return reply.badRequest('Column name is required')
    }

    const table = await db.select().from(tables).where(eq(tables.id, tableId))
    if (!table.length) {
      return reply.notFound('Table not found')
    }

    const currentCols = await db
      .select()
      .from(columns)
      .where(eq(columns.tableId, tableId))

    const newId = nanoid(10)
    const [newCol] = await db
      .insert(columns)
      .values({
        id: newId,
        tableId,
        name: body.name.trim(),
        type: body.type || 'number',
        sortOrder: currentCols.length,
        createdAt: new Date(),
      })
      .returning()

    const fullTable = await getFullTable(tableId)
    sseHub.broadcast(tableId, SSE_EVENTS.tableUpdated, fullTable)

    return reply.status(201).send(newCol)
  })

  // Update column
  fastify.put('/api/tables/:id/columns/:columnId', async (request, reply) => {
    const { id: tableId, columnId } = request.params as { id: string; columnId: string }
    const body = request.body as { name?: string; type?: ColumnType }

    if (!body?.name || typeof body.name !== 'string' || !body.name.trim()) {
      return reply.badRequest('Column name is required')
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
        name: body.name.trim(),
        type: body.type || column.type,
      })
      .where(eq(columns.id, columnId))
      .returning()

    await db.update(tables).set({ updatedAt: new Date() }).where(eq(tables.id, tableId))

    const fullTable = await getFullTable(tableId)
    sseHub.broadcast(tableId, SSE_EVENTS.tableUpdated, fullTable)

    return reply.send(updatedCol)
  })

  // Update participant scores (Form submit per participant)
  fastify.put('/api/tables/:id/participants/:participantId/scores', async (request, reply) => {
    const { id: tableId, participantId } = request.params as { id: string; participantId: string }
    const body = request.body as { scores?: Record<string, string | number> }

    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.id, participantId))

    if (!participant || participant.tableId !== tableId) {
      return reply.notFound('Participant not found')
    }

    const scoresObj = body?.scores || {}
    const now = new Date()

    for (const [columnId, rawValue] of Object.entries(scoresObj)) {
      const valStr = rawValue !== undefined && rawValue !== null ? String(rawValue).trim() : ''
      const existing = await db
        .select()
        .from(scores)
        .where(eq(scores.participantId, participantId))

      const existingScore = existing.find((s) => s.columnId === columnId)

      if (existingScore) {
        await db
          .update(scores)
          .set({ value: valStr, updatedAt: now })
          .where(eq(scores.id, existingScore.id))
      } else {
        await db.insert(scores).values({
          id: nanoid(10),
          tableId,
          participantId,
          columnId,
          value: valStr,
          updatedAt: now,
        })
      }
    }

    await db.update(tables).set({ updatedAt: now }).where(eq(tables.id, tableId))

    const fullTable = await getFullTable(tableId)
    sseHub.broadcast(tableId, SSE_EVENTS.tableUpdated, fullTable)

    return reply.send({ success: true, table: fullTable })
  })

  // Delete participant
  fastify.delete('/api/tables/:id/participants/:participantId', async (request, reply) => {
    const { id: tableId, participantId } = request.params as { id: string; participantId: string }

    await db
      .delete(participants)
      .where(eq(participants.id, participantId))

    const fullTable = await getFullTable(tableId)
    if (fullTable) {
      sseHub.broadcast(tableId, SSE_EVENTS.tableUpdated, fullTable)
    }

    return reply.send({ success: true })
  })

  // Delete column
  fastify.delete('/api/tables/:id/columns/:columnId', async (request, reply) => {
    const { id: tableId, columnId } = request.params as { id: string; columnId: string }

    await db
      .delete(columns)
      .where(eq(columns.id, columnId))

    const fullTable = await getFullTable(tableId)
    if (fullTable) {
      sseHub.broadcast(tableId, SSE_EVENTS.tableUpdated, fullTable)
    }

    return reply.send({ success: true })
  })

  // Delete table
  fastify.delete('/api/tables/:id', async (request, reply) => {
    const { id: tableId } = request.params as { id: string }

    await db
      .delete(tables)
      .where(eq(tables.id, tableId))

    return reply.send({ success: true })
  })
}


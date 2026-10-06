import { pgTable, varchar, text, integer, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import type { ColumnType } from '@tablora/shared'

export const tables = pgTable('tables', {
  id: varchar('id', { length: 36 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const columns = pgTable('columns', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tableId: varchar('table_id', { length: 36 })
    .notNull()
    .references(() => tables.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).$type<ColumnType>().notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('columns_table_id_idx').on(table.tableId),
])

export const participants = pgTable('participants', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tableId: varchar('table_id', { length: 36 })
    .notNull()
    .references(() => tables.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('participants_table_id_idx').on(table.tableId),
])

export const scores = pgTable('scores', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tableId: varchar('table_id', { length: 36 })
    .notNull()
    .references(() => tables.id, { onDelete: 'cascade' }),
  participantId: varchar('participant_id', { length: 36 })
    .notNull()
    .references(() => participants.id, { onDelete: 'cascade' }),
  columnId: varchar('column_id', { length: 36 })
    .notNull()
    .references(() => columns.id, { onDelete: 'cascade' }),
  value: text('value').notNull().default(''),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('scores_participant_column_unique_idx').on(table.participantId, table.columnId),
  index('scores_table_id_idx').on(table.tableId),
])

export const tablesRelations = relations(tables, ({ many }) => ({
  columns: many(columns),
  participants: many(participants),
  scores: many(scores),
}))

export const columnsRelations = relations(columns, ({ one }) => ({
  table: one(tables, {
    fields: [columns.tableId],
    references: [tables.id],
  }),
}))

export const participantsRelations = relations(participants, ({ one, many }) => ({
  table: one(tables, {
    fields: [participants.tableId],
    references: [tables.id],
  }),
  scores: many(scores),
}))

export const scoresRelations = relations(scores, ({ one }) => ({
  table: one(tables, {
    fields: [scores.tableId],
    references: [tables.id],
  }),
  participant: one(participants, {
    fields: [scores.participantId],
    references: [participants.id],
  }),
  column: one(columns, {
    fields: [scores.columnId],
    references: [columns.id],
  }),
}))

export type Table = typeof tables.$inferSelect
export type NewTable = typeof tables.$inferInsert

export type Column = typeof columns.$inferSelect
export type NewColumn = typeof columns.$inferInsert

export type Participant = typeof participants.$inferSelect
export type NewParticipant = typeof participants.$inferInsert

export type Score = typeof scores.$inferSelect
export type NewScore = typeof scores.$inferInsert


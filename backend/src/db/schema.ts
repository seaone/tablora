import { pgTable, varchar, text, integer, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import type { ColumnType } from '@tablora/shared'

export const users = pgTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

/**
 * One row per external identity. A user is identified by (provider, providerUserId),
 * so additional providers (VK ID, Google) can be added later without reshaping users.
 */
export const identities = pgTable('identities', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 32 }).notNull(),
  providerUserId: varchar('provider_user_id', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('identities_provider_user_unique_idx').on(table.provider, table.providerUserId),
  index('identities_user_id_idx').on(table.userId),
])

export const tables = pgTable('tables', {
  id: varchar('id', { length: 36 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  ownerId: varchar('owner_id', { length: 36 }).references(() => users.id, { onDelete: 'set null' }),
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

/**
 * An active sign-in session. The row's id is the JWT's `jti`, so deleting the row
 * revokes the session immediately.
 */
export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('sessions_user_id_idx').on(table.userId),
])

/** A judge authorized by a table's owner, matched by the judge's Yandex email. */
export const tableJudges = pgTable('table_judges', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tableId: varchar('table_id', { length: 36 })
    .notNull()
    .references(() => tables.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('table_judges_table_email_unique_idx').on(table.tableId, table.email),
  index('table_judges_table_id_idx').on(table.tableId),
])

export const usersRelations = relations(users, ({ many }) => ({
  identities: many(identities),
  sessions: many(sessions),
  tables: many(tables),
}))

export const identitiesRelations = relations(identities, ({ one }) => ({
  user: one(users, {
    fields: [identities.userId],
    references: [users.id],
  }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const tablesRelations = relations(tables, ({ one, many }) => ({
  owner: one(users, {
    fields: [tables.ownerId],
    references: [users.id],
  }),
  columns: many(columns),
  participants: many(participants),
  scores: many(scores),
  judges: many(tableJudges),
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

export const tableJudgesRelations = relations(tableJudges, ({ one }) => ({
  table: one(tables, {
    fields: [tableJudges.tableId],
    references: [tables.id],
  }),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Identity = typeof identities.$inferSelect
export type NewIdentity = typeof identities.$inferInsert

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert

export type TableJudge = typeof tableJudges.$inferSelect
export type NewTableJudge = typeof tableJudges.$inferInsert

export type Table = typeof tables.$inferSelect
export type NewTable = typeof tables.$inferInsert

export type Column = typeof columns.$inferSelect
export type NewColumn = typeof columns.$inferInsert

export type Participant = typeof participants.$inferSelect
export type NewParticipant = typeof participants.$inferInsert

export type Score = typeof scores.$inferSelect
export type NewScore = typeof scores.$inferInsert

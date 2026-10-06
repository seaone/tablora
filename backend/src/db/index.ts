import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as dotenv from 'dotenv'
import * as schema from './schema.js'

dotenv.config()

const connectionString = process.env.DATABASE_URL || 'postgresql://tablora:tablora_password@localhost:5432/tablora'

export const sql = postgres(connectionString, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
})

export const db = drizzle(sql, { schema })

export async function ensureTablesExist() {
  await sql`
    CREATE TABLE IF NOT EXISTS tables (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS columns (
      id VARCHAR(36) PRIMARY KEY,
      table_id VARCHAR(36) NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      type VARCHAR(20) NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS columns_table_id_idx ON columns(table_id);
  `

  await sql`
    CREATE TABLE IF NOT EXISTS participants (
      id VARCHAR(36) PRIMARY KEY,
      table_id VARCHAR(36) NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS participants_table_id_idx ON participants(table_id);
  `

  await sql`
    CREATE TABLE IF NOT EXISTS scores (
      id VARCHAR(36) PRIMARY KEY,
      table_id VARCHAR(36) NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
      participant_id VARCHAR(36) NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
      column_id VARCHAR(36) NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
      value TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS scores_participant_column_unique_idx ON scores(participant_id, column_id);
    CREATE INDEX IF NOT EXISTS scores_table_id_idx ON scores(table_id);
  `
}


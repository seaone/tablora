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

// Each tagged query below is sent as a single prepared statement, so a statement
// must never be combined with another in one template literal — postgres.js rejects
// that with "cannot insert multiple commands into a prepared statement".
export async function ensureTablesExist() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      display_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS identities (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider VARCHAR(32) NOT NULL,
      provider_user_id VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS identities_provider_user_unique_idx ON identities(provider, provider_user_id);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS identities_user_id_idx ON identities(user_id);
  `

  await sql`
    CREATE TABLE IF NOT EXISTS tables (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      owner_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `

  // Tables created before ownership existed need the column added separately,
  // since CREATE TABLE IF NOT EXISTS leaves an existing table untouched.
  await sql`
    ALTER TABLE tables ADD COLUMN IF NOT EXISTS owner_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL;
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
  `

  await sql`
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
  `

  // Older databases predate the description field.
  await sql`
    ALTER TABLE participants ADD COLUMN IF NOT EXISTS description TEXT;
  `

  await sql`
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
  `

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS scores_participant_column_unique_idx ON scores(participant_id, column_id);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS scores_table_id_idx ON scores(table_id);
  `

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `

  await sql`
    CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);
  `

  await sql`
    CREATE TABLE IF NOT EXISTS table_judges (
      id VARCHAR(36) PRIMARY KEY,
      table_id VARCHAR(36) NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
      email VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS table_judges_table_email_unique_idx ON table_judges(table_id, email);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS table_judges_table_id_idx ON table_judges(table_id);
  `
}


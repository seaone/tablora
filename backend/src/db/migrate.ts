import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL || 'postgresql://tablora:tablora_password@localhost:5432/tablora'
const client = postgres(connectionString, { max: 1 })
const db = drizzle(client)

async function runMigrations() {
  console.log('Running migrations from ./drizzle...')
  await migrate(db, { migrationsFolder: './drizzle' })
  console.log('Migrations completed successfully.')
  await client.end()
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})


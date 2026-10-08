import { ensureTablesExist, sql } from './index.js'

try {
  await ensureTablesExist()
  console.log('Database schema ensured')
} catch (err) {
  console.error('Failed to ensure database schema:', err)
  process.exitCode = 1
} finally {
  await sql.end()
}

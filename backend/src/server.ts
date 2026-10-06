import { buildApp } from './app.js'
import { ensureTablesExist, sql } from './db/index.js'
import { sseHub } from './realtime/sse-hub.js'

const PORT = Number(process.env.PORT) || 4000
const HOST = process.env.HOST || '0.0.0.0'

const start = async () => {
  const app = buildApp()

  try {
    // Ensure DB tables exist on launch
    try {
      await ensureTablesExist()
      app.log.info('Database schema verified / initialized successfully')
    } catch (dbErr) {
      app.log.warn({ err: dbErr }, 'Could not initialize DB tables on startup (PostgreSQL might be booting)')
    }

    await app.listen({ port: PORT, host: HOST })
    console.log(`🚀 Tablora backend running on http://${HOST}:${PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }

  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM']
  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}, closing server gracefully...`)
      sseHub.destroy()
      await app.close()
      await sql.end()
      process.exit(0)
    })
  }
}

start()


import Fastify from 'fastify'
import cors from '@fastify/cors'
import sensible from '@fastify/sensible'
import { tableRoutes } from './routes/tables.js'

export function buildApp(opts = {}) {
  const isTest = process.env.NODE_ENV === 'test'
  const app = Fastify({
    logger: isTest ? false : { level: process.env.LOG_LEVEL || 'info' },
    ...opts,
  })

  app.register(cors, {
    origin: true, // Allow frontend dev server and mobile connections
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  app.register(sensible)

  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  app.register(tableRoutes)

  return app
}


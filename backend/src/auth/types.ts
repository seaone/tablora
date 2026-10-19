import type { AuthUser, TableAccessRole } from '@tablora/shared'

/** A caller's resolved relationship to a table. */
export interface TableAccess {
  role: TableAccessRole
}

declare module 'fastify' {
  interface FastifyRequest {
    /** The signed-in user, or null when the request is anonymous. Set by the resolveUser hook. */
    authUser: AuthUser | null
  }
}

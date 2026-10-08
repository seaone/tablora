import type { AuthUser, TableAccessRole } from '@tablora/shared'

/** A caller's resolved relationship to a table plus its owner, if any. */
export interface TableAccess {
  role: TableAccessRole
  ownerId: string | null
}

declare module 'fastify' {
  interface FastifyRequest {
    /** The signed-in user, or null when the request is anonymous. Set by the resolveUser hook. */
    authUser: AuthUser | null
    /** Set by the table-access guards. */
    tableAccess?: TableAccess
  }
}

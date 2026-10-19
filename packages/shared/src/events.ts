/**
 * Server-Sent Events emitted by the backend and consumed by the frontend.
 * Keep both sides in sync by referencing these constants instead of literals.
 */
export const SSE_EVENTS = {
  /** Handshake sent once a client subscribes. */
  connected: "connected",
  /** Initial full-table snapshot sent on subscribe. */
  tableSnapshot: "table_snapshot",
  /** Full-table update broadcast after any mutation. */
  tableUpdated: "table_updated",
  /** Sent when the table is deleted; clients should stop reconnecting. */
  tableDeleted: "table_deleted",
} as const;

export type SSEEventName = (typeof SSE_EVENTS)[keyof typeof SSE_EVENTS];

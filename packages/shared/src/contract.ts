/**
 * Wire-format contract shared between the backend and the frontend.
 */

/** Score column types supported by a table. */
export const COLUMN_TYPES = ["number", "text", "time"] as const;
export type ColumnType = (typeof COLUMN_TYPES)[number];

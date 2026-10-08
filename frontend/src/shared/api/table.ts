import type { ColumnType, TableAccessRole } from "@tablora/shared";

export type { ColumnType, TableAccessRole };

export interface TableColumn {
  id: string;
  tableId: string;
  name: string;
  type: ColumnType;
  sortOrder: number;
  createdAt: string;
}

export interface Participant {
  id: string;
  tableId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface Score {
  id: string;
  tableId: string;
  participantId: string;
  columnId: string;
  value: string;
  updatedAt: string;
}

export interface TableJudge {
  id: string;
  tableId: string;
  email: string;
  createdAt: string;
}

export interface FullTableData {
  id: string;
  title: string;
  description: string | null;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
  columns: TableColumn[];
  participants: Participant[];
  scores: Score[];
}

export interface CreateTablePayload {
  title: string;
  description?: string;
  columns: Array<{ name: string; type: ColumnType }>;
  participants: Array<{ name: string; description?: string }>;
}

/** A table as it appears in a signed-in user's directory, with their role for it. */
export interface MyTableSummary {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  role: Extract<TableAccessRole, "owner" | "judge">;
}

/** Role filter for the directory list. */
export type MyTablesRoleFilter = "all" | "owner" | "judge";

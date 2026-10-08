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

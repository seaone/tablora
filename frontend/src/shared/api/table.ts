import type { ColumnType } from "@tablora/shared";

export type { ColumnType };

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

export interface FullTableData {
  id: string;
  title: string;
  description: string | null;
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

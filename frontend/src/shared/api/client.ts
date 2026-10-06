import { APP_CONFIG } from "@/shared/config";
import type {
  FullTableData,
  CreateTablePayload,
  Participant,
  TableColumn,
  ColumnType,
} from "./table";

const baseUrl = APP_CONFIG.apiUrl;

export async function fetchTable(id: string): Promise<FullTableData> {
  const res = await fetch(`${baseUrl}/api/tables/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load table: ${res.statusText}`);
  }
  return res.json();
}

export async function createTable(payload: CreateTablePayload): Promise<FullTableData> {
  const res = await fetch(`${baseUrl}/api/tables`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create table: ${errorText || res.statusText}`);
  }
  return res.json();
}

export async function submitScores(
  tableId: string,
  participantId: string,
  scores: Record<string, string | number>,
): Promise<{ success: boolean; table: FullTableData }> {
  const res = await fetch(`${baseUrl}/api/tables/${tableId}/participants/${participantId}/scores`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scores }),
  });
  if (!res.ok) {
    throw new Error("Failed to save scores");
  }
  return res.json();
}

export async function addParticipant(
  tableId: string,
  name: string,
  description?: string,
): Promise<Participant> {
  const res = await fetch(`${baseUrl}/api/tables/${tableId}/participants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) {
    throw new Error("Failed to add participant");
  }
  return res.json();
}

export async function updateParticipant(
  tableId: string,
  participantId: string,
  name: string,
  description?: string,
): Promise<Participant> {
  const res = await fetch(`${baseUrl}/api/tables/${tableId}/participants/${participantId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) {
    throw new Error("Failed to update participant");
  }
  return res.json();
}

export async function addColumn(
  tableId: string,
  name: string,
  type: ColumnType,
): Promise<TableColumn> {
  const res = await fetch(`${baseUrl}/api/tables/${tableId}/columns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, type }),
  });
  if (!res.ok) {
    throw new Error("Failed to add column");
  }
  return res.json();
}

export async function updateColumn(
  tableId: string,
  columnId: string,
  name: string,
  type: ColumnType,
): Promise<TableColumn> {
  const res = await fetch(`${baseUrl}/api/tables/${tableId}/columns/${columnId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, type }),
  });
  if (!res.ok) {
    throw new Error("Failed to update column");
  }
  return res.json();
}

export async function deleteParticipant(
  tableId: string,
  participantId: string,
): Promise<{ success: boolean }> {
  const res = await fetch(`${baseUrl}/api/tables/${tableId}/participants/${participantId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete participant");
  }
  return res.json();
}

export async function deleteColumn(
  tableId: string,
  columnId: string,
): Promise<{ success: boolean }> {
  const res = await fetch(`${baseUrl}/api/tables/${tableId}/columns/${columnId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete column");
  }
  return res.json();
}

export async function deleteTable(tableId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${baseUrl}/api/tables/${tableId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete table");
  }
  return res.json();
}

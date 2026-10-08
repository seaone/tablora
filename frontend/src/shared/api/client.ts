import { APP_CONFIG } from "@/shared/config";
import type {
  FullTableData,
  CreateTablePayload,
  Participant,
  TableColumn,
  TableJudge,
  TableAccessRole,
  ColumnType,
  MyTableSummary,
} from "./table";

const baseUrl = APP_CONFIG.apiUrl;

/** All requests send the session cookie so authenticated calls work cross-origin. */
const jsonHeaders = { "Content-Type": "application/json" };

/** Tables the signed-in user owns or is authorized to judge. */
export async function fetchMyTables(): Promise<MyTableSummary[]> {
  const res = await fetch(`${baseUrl}/api/tables`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Failed to load tables: ${res.statusText}`);
  }
  const data = (await res.json()) as { tables: MyTableSummary[] };
  return data.tables;
}

export async function fetchTable(id: string): Promise<FullTableData> {
  const res = await fetch(`${baseUrl}/api/tables/${id}`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Failed to load table: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchTableAccess(id: string): Promise<TableAccessRole> {
  const res = await fetch(`${baseUrl}/api/tables/${id}/access`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Failed to load access: ${res.statusText}`);
  }
  const data = (await res.json()) as { role: TableAccessRole };
  return data.role;
}

export async function createTable(payload: CreateTablePayload): Promise<FullTableData> {
  const res = await fetch(`${baseUrl}/api/tables`, {
    method: "POST",
    headers: jsonHeaders,
    credentials: "include",
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
    headers: jsonHeaders,
    credentials: "include",
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
    headers: jsonHeaders,
    credentials: "include",
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
    headers: jsonHeaders,
    credentials: "include",
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
    headers: jsonHeaders,
    credentials: "include",
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
    headers: jsonHeaders,
    credentials: "include",
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
    credentials: "include",
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
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to delete column");
  }
  return res.json();
}

export async function deleteTable(tableId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${baseUrl}/api/tables/${tableId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to delete table");
  }
  return res.json();
}

export async function fetchJudges(tableId: string): Promise<TableJudge[]> {
  const res = await fetch(`${baseUrl}/api/tables/${tableId}/judges`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to load judges");
  }
  const data = (await res.json()) as { judges: TableJudge[] };
  return data.judges;
}

export async function addJudge(
  tableId: string,
  email: string,
): Promise<{ judge: TableJudge; created: boolean }> {
  const res = await fetch(`${baseUrl}/api/tables/${tableId}/judges`, {
    method: "POST",
    headers: jsonHeaders,
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw new Error("Failed to add judge");
  }
  return res.json();
}

export async function removeJudge(tableId: string, judgeId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${baseUrl}/api/tables/${tableId}/judges/${judgeId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to remove judge");
  }
  return res.json();
}

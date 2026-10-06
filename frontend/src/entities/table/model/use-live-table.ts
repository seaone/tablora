"use client";

import { useCallback, useEffect, useState } from "react";
import { type FullTableData, fetchTable, subscribeToTable } from "@/shared/api";

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export function useLiveTable(tableId: string) {
  const [data, setData] = useState<FullTableData | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  const refresh = useCallback(async () => {
    try {
      const fresh = await fetchTable(tableId);
      setData(fresh);
    } catch (err: unknown) {
      console.error(err instanceof Error ? err.message : "Failed to load table");
    }
  }, [tableId]);

  useEffect(() => {
    setStatus("connecting");
    refresh();

    return subscribeToTable(tableId, {
      onSnapshot: (table) => {
        setData(table);
        setStatus("connected");
      },
      onConnected: () => setStatus("connected"),
      onDisconnected: () => setStatus("disconnected"),
    });
  }, [tableId, refresh]);

  return { data, status, refresh };
}

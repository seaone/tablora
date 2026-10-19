"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, type FullTableData, fetchTable, subscribeToTable } from "@/shared/api";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export function useLiveTable(tableId: string) {
  const [data, setData] = useState<FullTableData | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [notFound, setNotFound] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const tableIdRef = useRef(tableId);

  const refresh = useCallback(async () => {
    const requestedId = tableId;
    try {
      const fresh = await fetchTable(requestedId);
      if (tableIdRef.current !== requestedId) return;
      // A slow fetch can land after a newer SSE snapshot; keep the newer one.
      setData((current) =>
        !current || Date.parse(fresh.updatedAt) >= Date.parse(current.updatedAt) ? fresh : current,
      );
      setNotFound(false);
    } catch (err: unknown) {
      if (tableIdRef.current !== requestedId) return;
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
        unsubscribeRef.current?.();
        return;
      }
      console.error(err instanceof Error ? err.message : "Failed to load table");
    }
  }, [tableId]);

  useEffect(() => {
    tableIdRef.current = tableId;
    setData(null);
    setStatus("connecting");
    setNotFound(false);

    const unsubscribe = subscribeToTable(tableId, {
      onSnapshot: (table) => {
        if (table.id !== tableIdRef.current) return;
        setData(table);
        setNotFound(false);
        setStatus("connected");
      },
      onConnected: () => setStatus("connected"),
      onDisconnected: () => {
        setStatus("disconnected");
        // Catch a table deleted while this client was offline.
        void refresh();
      },
      onDeleted: () => {
        setData(null);
        setNotFound(true);
        setStatus("disconnected");
      },
    });
    unsubscribeRef.current = unsubscribe;
    void refresh();

    return () => {
      unsubscribeRef.current = null;
      unsubscribe();
    };
  }, [tableId, refresh]);

  return { data, status, notFound, refresh };
}

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addJudge as apiAddJudge,
  fetchJudges,
  removeJudge as apiRemoveJudge,
  type TableJudge,
} from "@/shared/api";

/** Manages a table's authorized judges. Mounted only for the table's owner. */
export function useTableJudges(tableId: string) {
  const [judges, setJudges] = useState<TableJudge[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      setJudges(await fetchJudges(tableId));
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [tableId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addJudge = useCallback(
    async (email: string) => {
      await apiAddJudge(tableId, email);
      await reload();
    },
    [tableId, reload],
  );

  const removeJudge = useCallback(
    async (judgeId: string) => {
      await apiRemoveJudge(tableId, judgeId);
      await reload();
    },
    [tableId, reload],
  );

  return { judges, loading, loadError, addJudge, removeJudge };
}

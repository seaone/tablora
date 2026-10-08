"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addJudge as apiAddJudge,
  fetchJudges,
  removeJudge as apiRemoveJudge,
  type TableJudge,
} from "@/shared/api";

/** Manages a table's authorized judges. Only runs when `enabled` (i.e. the caller is the owner). */
export function useTableJudges(tableId: string, enabled: boolean) {
  const [judges, setJudges] = useState<TableJudge[]>([]);
  const [loading, setLoading] = useState(enabled);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      setJudges(await fetchJudges(tableId));
    } finally {
      setLoading(false);
    }
  }, [tableId, enabled]);

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

  return { judges, loading, addJudge, removeJudge };
}

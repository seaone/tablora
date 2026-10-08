"use client";

import { useEffect, useState } from "react";
import type { TableAccessRole } from "@tablora/shared";
import { useAuth } from "@/entities/user";
import { fetchTableAccess } from "@/shared/api";

/**
 * Resolves whether the caller may edit the table. Re-runs when the signed-in
 * user changes, so signing in or out updates the judge page's authorization.
 */
export function useJudgeAccess(tableId: string) {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<TableAccessRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchTableAccess(tableId)
      .then((value) => {
        if (active) setRole(value);
      })
      .catch(() => {
        if (active) setRole(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tableId, user?.id]);

  return {
    user,
    authLoading,
    role,
    loading,
    isEditor: role === "owner" || role === "judge",
  };
}

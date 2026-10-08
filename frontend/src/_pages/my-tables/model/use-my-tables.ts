"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/entities/user";
import { fetchMyTables, type MyTableSummary } from "@/shared/api";

interface UseMyTablesResult {
  tables: MyTableSummary[];
  loading: boolean;
  error: boolean;
  authLoading: boolean;
  authed: boolean;
}

/** Loads the signed-in user's directory of owned and judged tables. */
export function useMyTables(): UseMyTablesResult {
  const { user, loading: authLoading } = useAuth();
  const [tables, setTables] = useState<MyTableSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (authLoading || !user) {
      setTables([]);
      return;
    }

    let active = true;
    setLoading(true);
    setError(false);

    fetchMyTables()
      .then((data) => {
        if (active) setTables(data);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, user?.id]);

  return { tables, loading, error, authLoading, authed: Boolean(user) };
}

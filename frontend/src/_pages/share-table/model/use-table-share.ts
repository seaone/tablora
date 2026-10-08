"use client";

import { useState, useEffect } from "react";
import type { TableAccessRole } from "@tablora/shared";
import { useAuth } from "@/entities/user";
import { fetchTable, fetchTableAccess, type FullTableData } from "@/shared/api";

export const useTableShare = (tableId: string) => {
  const { user } = useAuth();
  const [table, setTable] = useState<FullTableData | null>(null);
  const [role, setRole] = useState<TableAccessRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedJudge, setCopiedJudge] = useState(false);
  const [copiedSpectator, setCopiedSpectator] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }

    fetchTable(tableId)
      .then((data) => {
        setTable(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [tableId]);

  useEffect(() => {
    let active = true;
    fetchTableAccess(tableId)
      .then((value) => {
        if (active) setRole(value);
      })
      .catch(() => {
        if (active) setRole(null);
      });
    return () => {
      active = false;
    };
  }, [tableId, user?.id]);

  const judgeUrl = `${origin}/t/${tableId}/edit`;
  const spectatorUrl = `${origin}/t/${tableId}`;

  const copyToClipboard = (text: string, isJudge: boolean) => {
    navigator.clipboard.writeText(text);
    if (isJudge) {
      setCopiedJudge(true);
      setTimeout(() => setCopiedJudge(false), 2000);
    } else {
      setCopiedSpectator(true);
      setTimeout(() => setCopiedSpectator(false), 2000);
    }
  };

  return {
    table,
    role,
    loading,
    copiedJudge,
    copiedSpectator,
    judgeUrl,
    spectatorUrl,
    copyToClipboard,
  };
};

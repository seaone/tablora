"use client";

import { useState, useEffect } from "react";
import type { TableAccessRole } from "@tablora/shared";
import { useAuth } from "@/entities/user";
import { ApiError, fetchTable, fetchTableAccess, type FullTableData } from "@/shared/api";
import { copyText } from "@/shared/lib";

export const useTableShare = (tableId: string) => {
  const { user } = useAuth();
  const [table, setTable] = useState<FullTableData | null>(null);
  const [role, setRole] = useState<TableAccessRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [accessError, setAccessError] = useState(false);
  const [copiedJudge, setCopiedJudge] = useState(false);
  const [copiedSpectator, setCopiedSpectator] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    let active = true;
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
    setLoading(true);
    setNotFound(false);
    setError(false);
    setTable(null);

    fetchTable(tableId)
      .then((data) => {
        if (!active) return;
        setTable(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(true);
          console.error(err);
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [tableId]);

  useEffect(() => {
    let active = true;
    setRole(null);
    setAccessError(false);
    fetchTableAccess(tableId)
      .then((value) => {
        if (active) setRole(value);
      })
      .catch(() => {
        if (active) setAccessError(true);
      });
    return () => {
      active = false;
    };
  }, [tableId, user?.id]);

  const judgeUrl = `${origin}/t/${tableId}/edit`;
  const spectatorUrl = `${origin}/t/${tableId}`;

  const copyToClipboard = async (text: string, isJudge: boolean) => {
    if (!(await copyText(text))) return;
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
    notFound,
    error,
    accessError,
    copiedJudge,
    copiedSpectator,
    judgeUrl,
    spectatorUrl,
    copyToClipboard,
  };
};

"use client";

import { useState, useEffect } from "react";
import { fetchTable, type FullTableData } from "@/shared/api";

export const useTableShare = (tableId: string) => {
  const [table, setTable] = useState<FullTableData | null>(null);
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
    loading,
    copiedJudge,
    copiedSpectator,
    judgeUrl,
    spectatorUrl,
    copyToClipboard,
  };
};

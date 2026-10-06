"use client";

import { useState, useMemo } from "react";
import { useLiveTable } from "@/entities/table";

export type SortDirection = "asc" | "desc" | null;

// Convert time string "mm:ss.ms" or "mm:ss" or "hh:mm:ss" to total milliseconds for accurate sorting
export const parseTimeToMs = (timeStr: string): number => {
  if (!timeStr) return Infinity;
  const parts = timeStr.trim().split(":");
  if (parts.length === 1) return Number(parts[0]) || Infinity;

  if (parts.length === 2) {
    const minutes = Number(parts[0]) || 0;
    const seconds = Number(parts[1]) || 0;
    return minutes * 60 + seconds;
  }

  if (parts.length === 3) {
    const hours = Number(parts[0]) || 0;
    const minutes = Number(parts[1]) || 0;
    const seconds = Number(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  }

  return Infinity;
};

export const useSpectatorTable = (tableId: string) => {
  const { data: table, status } = useLiveTable(tableId);
  const [sortColumnId, setSortColumnId] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const spectatorUrl = typeof window !== "undefined" ? window.location.href : "";

  // Fullscreen toggle
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document
          .exitFullscreen()
          .then(() => setIsFullscreen(false))
          .catch(() => {});
      }
    }
  };

  // Handle column header sorting
  const handleSort = (columnId: string) => {
    if (sortColumnId !== columnId) {
      setSortColumnId(columnId);
      setSortDirection("desc");
    } else if (sortDirection === "desc") {
      setSortDirection("asc");
    } else {
      setSortColumnId(null);
      setSortDirection(null);
    }
  };

  // Calculate sorted participants
  const sortedParticipants = useMemo(() => {
    if (!table) return [];

    const list = [...table.participants];

    if (!sortColumnId || !sortDirection) {
      return list.sort((a, b) => a.sortOrder - b.sortOrder);
    }

    const targetColumn = table.columns.find((c) => c.id === sortColumnId);
    if (!targetColumn) return list;

    return list.sort((pA, pB) => {
      const scoreA =
        table.scores.find((s) => s.participantId === pA.id && s.columnId === sortColumnId)?.value ||
        "";
      const scoreB =
        table.scores.find((s) => s.participantId === pB.id && s.columnId === sortColumnId)?.value ||
        "";

      if (targetColumn.type === "number") {
        const valA = scoreA === "" ? -Infinity : Number(scoreA);
        const valB = scoreB === "" ? -Infinity : Number(scoreB);
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }

      if (targetColumn.type === "time") {
        const timeA = parseTimeToMs(scoreA);
        const timeB = parseTimeToMs(scoreB);
        return sortDirection === "asc" ? timeA - timeB : timeB - timeA;
      }

      return sortDirection === "asc" ? scoreA.localeCompare(scoreB) : scoreB.localeCompare(scoreA);
    });
  }, [table, sortColumnId, sortDirection]);

  return {
    table,
    status,
    sortColumnId,
    sortDirection,
    handleSort,
    sortedParticipants,
    isFullscreen,
    toggleFullScreen,
    spectatorUrl,
  };
};

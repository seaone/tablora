"use client";

import { useMemo, useState } from "react";
import { useLiveTable } from "@/entities/table";
import { compareScoreValues } from "./sort";

export type SortDirection = "asc" | "desc" | null;

export const useSpectatorTable = (tableId: string) => {
  const { data: table, status, notFound } = useLiveTable(tableId);
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
      const column = table?.columns.find((c) => c.id === columnId);
      setSortColumnId(columnId);
      // Lower is better for times, higher is better for points.
      setSortDirection(column?.type === "time" ? "asc" : "desc");
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

    const scores = new Map<string, string>();
    for (const score of table.scores) {
      scores.set(`${score.participantId}:${score.columnId}`, score.value);
    }
    const valueFor = (participantId: string) =>
      scores.get(`${participantId}:${sortColumnId}`) ?? "";

    return list.sort((pA, pB) =>
      compareScoreValues(targetColumn.type, sortDirection, valueFor(pA.id), valueFor(pB.id)),
    );
  }, [table, sortColumnId, sortDirection]);

  return {
    table,
    status,
    notFound,
    sortColumnId,
    sortDirection,
    handleSort,
    sortedParticipants,
    isFullscreen,
    toggleFullScreen,
    spectatorUrl,
  };
};

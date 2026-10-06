"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { type ColumnDraft, type ParticipantDraft, useLiveTable } from "@/entities/table";
import {
  addColumn,
  addParticipant,
  deleteColumn,
  deleteParticipant,
  deleteTable,
  type Participant,
  submitScores,
  type TableColumn,
  updateColumn,
  updateParticipant,
} from "@/shared/api";

export const useJudgeTable = (tableId: string) => {
  const router = useRouter();
  const { data: table, status, refresh } = useLiveTable(tableId);

  const [searchQuery, setSearchQuery] = useState("");

  const handleAddColumn = async (value: ColumnDraft) => {
    await addColumn(tableId, value.name, value.type);
    await refresh();
  };

  const handleUpdateColumn = async (column: TableColumn, value: ColumnDraft) => {
    await updateColumn(tableId, column.id, value.name, value.type);
    await refresh();
  };

  const handleAddParticipant = async (value: ParticipantDraft) => {
    await addParticipant(tableId, value.name, value.description);
    await refresh();
  };

  const handleUpdateParticipant = async (
    participant: Participant,
    value: ParticipantDraft,
    scores?: Record<string, string>,
  ) => {
    await updateParticipant(tableId, participant.id, value.name, value.description);
    if (scores) {
      await submitScores(tableId, participant.id, scores);
    }
    await refresh();
  };

  const handleDeleteColumn = async (column: TableColumn) => {
    await deleteColumn(tableId, column.id);
    await refresh();
  };

  const handleDeleteParticipant = async (participant: Participant) => {
    await deleteParticipant(tableId, participant.id);
    await refresh();
  };

  const handleDeleteTable = async () => {
    await deleteTable(tableId);
    router.push("/");
  };

  const filteredParticipants = table
    ? table.participants.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()),
      )
    : [];

  return {
    table,
    status,
    refresh,
    searchQuery,
    setSearchQuery,
    filteredParticipants,
    handleAddColumn,
    handleUpdateColumn,
    handleAddParticipant,
    handleUpdateParticipant,
    handleDeleteColumn,
    handleDeleteParticipant,
    handleDeleteTable,
  };
};

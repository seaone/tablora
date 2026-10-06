"use client";

import type { FullTableData } from "@/shared/api";
import { PreviewTable } from "@/entities/table";

interface Props {
  table: FullTableData;
}

function ShareTablePreview({ table }: Props) {
  return (
    <PreviewTable
      className="sticky top-24"
      title={table.title}
      description={table.description}
      columns={table.columns.map((col) => ({ id: col.id, name: col.name }))}
      participants={table.participants.map((part) => ({
        id: part.id,
        name: part.name,
        description: part.description,
        scores: table.columns.map(
          (col) =>
            table.scores.find((s) => s.participantId === part.id && s.columnId === col.id)?.value,
        ),
      }))}
    />
  );
}

export { ShareTablePreview };

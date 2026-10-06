"use client";

import type { ParticipantDraft } from "@/entities/table";
import { DeleteParticipant } from "@/features/delete-participant";
import { EditParticipant } from "@/features/edit-participant";
import type { Participant, Score, TableColumn } from "@/shared/api";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/shared/ui";

interface Props {
  participant: Participant;
  index: number;
  columns: TableColumn[];
  scores: Score[];
  onEditParticipant: (
    participant: Participant,
    value: ParticipantDraft,
    scores?: Record<string, string>,
  ) => void | Promise<void>;
  onDeleteParticipant: (participant: Participant) => void | Promise<void>;
}

function JudgeParticipantCard({
  participant,
  index,
  columns,
  scores,
  onEditParticipant,
  onDeleteParticipant,
}: Props) {
  return (
    <Item variant="outline" size="sm" className="items-start">
      <ItemMedia>
        <span className="w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold font-scoreboard text-xs flex items-center justify-center shrink-0 transition-colors">
          #{index + 1}
        </span>
      </ItemMedia>

      <ItemContent>
        <ItemTitle className="font-bold">{participant.name}</ItemTitle>

        {participant.description && (
          <ItemDescription className="text-xs">{participant.description}</ItemDescription>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs font-scoreboard">
          {columns.map((col) => {
            const scoreObj = scores.find(
              (s) => s.participantId === participant.id && s.columnId === col.id,
            );
            const scoreVal = scoreObj?.value;

            return (
              <span
                key={col.id}
                className="inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-md border border-border/30"
              >
                <span className="text-muted-foreground font-sans text-[10px]">{col.name}:</span>
                <span className="font-bold text-foreground">{scoreVal || "—"}</span>
              </span>
            );
          })}
        </div>
      </ItemContent>

      <ItemActions>
        <EditParticipant
          participant={participant}
          columns={columns}
          currentScores={scores}
          onSubmit={(value, nextScores) => onEditParticipant(participant, value, nextScores)}
        />
        <DeleteParticipant
          name={participant.name}
          onConfirm={() => onDeleteParticipant(participant)}
        />
      </ItemActions>
    </Item>
  );
}

export { JudgeParticipantCard };

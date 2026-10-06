import { Pencil } from "lucide-react";
import { useState } from "react";
import { type ParticipantDraft, ParticipantFormDialog } from "@/entities/table";
import type { Score, TableColumn } from "@/shared/api";
import { Button } from "@/shared/ui";

interface EditParticipantTarget {
  id: string;
  name: string;
  description?: string | null;
}

interface Props {
  participant: EditParticipantTarget;
  /** When provided, renders score fields for each column. */
  columns?: TableColumn[];
  currentScores?: Score[];
  /** Injected effect: whatever "saving a participant" means for the consumer. */
  onSubmit: (value: ParticipantDraft, scores?: Record<string, string>) => void | Promise<void>;
}

function EditParticipant({ participant, columns, currentScores, onSubmit }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialValue = { name: participant.name, description: participant.description ?? "" };

  const initialScores: Record<string, string> = {};
  if (columns) {
    for (const col of columns) {
      const entry = currentScores?.find(
        (s) => s.participantId === participant.id && s.columnId === col.id,
      );
      initialScores[col.id] = entry ? entry.value : "";
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setError(null);
      setIsOpen(true);
    } else if (!isSubmitting) {
      setIsOpen(false);
    }
  };

  const handleSubmit = async (value: ParticipantDraft, scores?: Record<string, string>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(value, scores);
      setIsSubmitting(false);
      setIsOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Не удалось сохранить изменения";
      setError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => handleOpenChange(true)}
        aria-label={`Редактировать ${participant.name}`}
      >
        <Pencil className="w-4 h-4" />
      </Button>

      <ParticipantFormDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        title={`Редактирование: ${participant.name}`}
        description="Измените имя, описание и результаты участника"
        submitLabel="Сохранить"
        submittingLabel="Сохранение..."
        initialValue={initialValue}
        columns={columns}
        initialScores={initialScores}
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </>
  );
}

export { EditParticipant };

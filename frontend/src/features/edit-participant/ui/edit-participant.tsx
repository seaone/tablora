import { Pencil } from "lucide-react";
import { type ParticipantDraft, ParticipantFormDialog } from "@/entities/table";
import type { Score, TableColumn } from "@/shared/api";
import { useDialogSubmit } from "@/shared/lib";
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
  const { isOpen, handleOpenChange, isSubmitting, error, submit } = useDialogSubmit(
    onSubmit,
    "Не удалось сохранить изменения",
  );

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
        onSubmit={submit}
      />
    </>
  );
}

export { EditParticipant };

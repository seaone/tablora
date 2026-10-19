import { User } from "lucide-react";
import { type ParticipantDraft, ParticipantFormDialog } from "@/entities/table";
import { useDialogSubmit } from "@/shared/lib";
import { Button } from "@/shared/ui";

interface Props {
  /** Injected effect: whatever "adding a participant" means for the consumer. */
  onSubmit: (value: ParticipantDraft) => void | Promise<void>;
  /** Button width utilities only, per the shared UI styling convention. */
  className?: string;
}

function AddParticipant({ onSubmit, className }: Props) {
  const { isOpen, handleOpenChange, isSubmitting, error, submit } = useDialogSubmit(
    onSubmit,
    "Не удалось добавить участника",
  );

  return (
    <>
      <Button
        onClick={() => handleOpenChange(true)}
        type="button"
        variant="outline"
        size="default"
        className={className}
      >
        <User className="w-4 h-4" />
        <span>+ Участник</span>
      </Button>

      <ParticipantFormDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        title="Добавить участника"
        description="Новый участник появится в таблице мгновенно"
        submitLabel="Добавить"
        submittingLabel="Добавление..."
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={submit}
      />
    </>
  );
}

export { AddParticipant };

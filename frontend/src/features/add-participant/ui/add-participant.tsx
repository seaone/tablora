import { User } from "lucide-react";
import { useState } from "react";
import { type ParticipantDraft, ParticipantFormDialog } from "@/entities/table";
import { Button } from "@/shared/ui";

interface Props {
  /** Injected effect: whatever "adding a participant" means for the consumer. */
  onSubmit: (value: ParticipantDraft) => void | Promise<void>;
  /** Button width utilities only, per the shared UI styling convention. */
  className?: string;
}

function AddParticipant({ onSubmit, className }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setError(null);
      setIsOpen(true);
    } else if (!isSubmitting) {
      setIsOpen(false);
    }
  };

  const handleSubmit = async (value: ParticipantDraft) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(value);
      setIsSubmitting(false);
      setIsOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Не удалось добавить участника";
      setError(msg);
      setIsSubmitting(false);
    }
  };

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
        onSubmit={handleSubmit}
      />
    </>
  );
}

export { AddParticipant };

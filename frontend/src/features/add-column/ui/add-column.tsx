import { Columns } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { type ColumnDraft, ColumnFormDialog } from "@/entities/table";
import { Button } from "@/shared/ui";

interface Props {
  /** Injected effect: whatever "adding a column" means for the consumer. */
  onSubmit: (value: ColumnDraft) => void | Promise<void>;
  triggerLabel?: string;
  triggerIcon?: React.ReactNode;
  /** Button width utilities only, per the shared UI styling convention. */
  className?: string;
}

function AddColumn({ onSubmit, className }: Props) {
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

  const handleSubmit = async (value: ColumnDraft) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(value);
      setIsSubmitting(false);
      setIsOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Не удалось добавить столбец";
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
        <Columns className="w-4 h-4" />
        <span>+ Столбец</span>
      </Button>

      <ColumnFormDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        title="Добавить столбец"
        description="Новый критерий оценивания появится для всех участников"
        submitLabel="Добавить"
        submittingLabel="Добавление..."
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </>
  );
}

export { AddColumn };

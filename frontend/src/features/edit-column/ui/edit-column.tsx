import { Pencil } from "lucide-react";
import { useState } from "react";
import { type ColumnDraft, ColumnFormDialog, type ColumnFormValue } from "@/entities/table";
import { Button } from "@/shared/ui";

interface Props {
  column: ColumnFormValue;
  /** Injected effect: whatever "saving a column" means for the consumer. */
  onSubmit: (value: ColumnDraft) => void | Promise<void>;
}

function EditColumn({ column, onSubmit }: Props) {
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
      const msg = err instanceof Error ? err.message : "Не удалось обновить столбец";
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
        aria-label={`Редактировать столбец ${column.name}`}
      >
        <Pencil className="w-4 h-4" />
      </Button>

      <ColumnFormDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        title="Редактировать столбец"
        description="Измените название и тип столбца"
        submitLabel="Сохранить"
        submittingLabel="Сохранение..."
        initialValue={column}
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </>
  );
}

export { EditColumn };

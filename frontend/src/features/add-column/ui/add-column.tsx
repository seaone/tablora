import { Columns } from "lucide-react";
import type React from "react";
import { type ColumnDraft, ColumnFormDialog } from "@/entities/table";
import { useDialogSubmit } from "@/shared/lib";
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
  const { isOpen, handleOpenChange, isSubmitting, error, submit } = useDialogSubmit(
    onSubmit,
    "Не удалось добавить столбец",
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
        onSubmit={submit}
      />
    </>
  );
}

export { AddColumn };

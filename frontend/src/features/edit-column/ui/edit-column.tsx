import { Pencil } from "lucide-react";
import { type ColumnDraft, ColumnFormDialog, type ColumnFormValue } from "@/entities/table";
import { useDialogSubmit } from "@/shared/lib";
import { Button } from "@/shared/ui";

interface Props {
  column: ColumnFormValue;
  /** Injected effect: whatever "saving a column" means for the consumer. */
  onSubmit: (value: ColumnDraft) => void | Promise<void>;
}

function EditColumn({ column, onSubmit }: Props) {
  const { isOpen, handleOpenChange, isSubmitting, error, submit } = useDialogSubmit(
    onSubmit,
    "Не удалось обновить столбец",
  );

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
        onSubmit={submit}
      />
    </>
  );
}

export { EditColumn };

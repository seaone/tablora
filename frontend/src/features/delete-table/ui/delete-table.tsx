import { Trash2 } from "lucide-react";
import { ACTION_LABELS } from "@/shared/config";
import { useDialogSubmit } from "@/shared/lib";
import { ActionTooltip, Button, ConfirmDialog } from "@/shared/ui";

interface DeleteTableProps {
  /** Injected effect: whatever "deleting the table" means for the consumer. */
  onConfirm: () => void | Promise<void>;
  /** Button variant; defaults to a prominent destructive button. */
  variant?: "destructive" | "ghost";
  /** Button size; defaults to `default`. */
  size?: "default" | "icon";
}

function DeleteTable({ onConfirm, variant = "destructive", size = "default" }: DeleteTableProps) {
  const { isOpen, handleOpenChange, isSubmitting, error, submit } = useDialogSubmit(
    onConfirm,
    "Не удалось удалить",
  );

  return (
    <>
      <ActionTooltip
        label={ACTION_LABELS.deleteTable}
        trigger={
          <Button
            type="button"
            variant={variant}
            size={size}
            onClick={() => handleOpenChange(true)}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </Button>
        }
      />
      <ConfirmDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        title="Удалить таблицу?"
        description="Вся таблица и все её данные будут удалены безвозвратно."
        error={error}
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        isLoading={isSubmitting}
        loadingLabel="Удаление..."
        onConfirm={submit}
      />
    </>
  );
}

export { DeleteTable };

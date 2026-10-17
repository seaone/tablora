import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ACTION_LABELS } from "@/shared/config";
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
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setError(null);
      setIsOpen(true);
    } else if (!isDeleting) {
      setIsOpen(false);
    }
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm();
      setIsDeleting(false);
      setIsOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Не удалось удалить";
      setError(msg);
      setIsDeleting(false);
    }
  };

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
        isLoading={isDeleting}
        loadingLabel="Удаление..."
        onConfirm={handleConfirm}
      />
    </>
  );
}

export { DeleteTable };

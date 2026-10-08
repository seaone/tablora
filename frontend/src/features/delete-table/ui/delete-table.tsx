import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button, ConfirmDialog } from "@/shared/ui";

const DELETE_LABEL = "Удалить таблицу";

interface DeleteTableProps {
  /** Injected effect: whatever "deleting the table" means for the consumer. */
  onConfirm: () => void | Promise<void>;
  /** Button variant; defaults to a prominent destructive button. */
  variant?: "destructive" | "ghost";
  /** Button size; defaults to the labeled button. */
  size?: "default" | "icon";
  /** Render the label next to the icon (hidden on small screens). */
  withLabel?: boolean;
}

function DeleteTable({
  onConfirm,
  variant = "destructive",
  size = "default",
  withLabel = false,
}: DeleteTableProps) {
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
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => handleOpenChange(true)}
        aria-label={DELETE_LABEL}
      >
        <Trash2 className="w-4 h-4" aria-hidden="true" />
        {withLabel ? <span className="hidden sm:inline">{DELETE_LABEL}</span> : null}
      </Button>

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

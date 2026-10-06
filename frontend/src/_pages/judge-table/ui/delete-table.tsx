import { Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useMediaQuery } from "@/shared/lib";
import { Button, ConfirmDialog } from "@/shared/ui";

interface DeleteTableProps {
  /** Injected effect: whatever "deleting the table" means for the consumer. */
  onConfirm: () => void | Promise<void>;
}

export const DeleteTable: React.FC<DeleteTableProps> = ({ onConfirm }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 640px)");

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
        variant="destructive"
        size={isMobile ? "icon" : "default"}
        onClick={() => handleOpenChange(true)}
      >
        <Trash2 className="w-4 h-4" />
        <span className="hidden sm:inline">Удалить таблицу</span>
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
};

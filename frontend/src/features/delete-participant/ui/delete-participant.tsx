import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button, ConfirmDialog } from "@/shared/ui";

interface Props {
  name: string;
  /** Deletion effect injected by the consumer (API call, form-state removal, …). */
  onConfirm: () => void | Promise<void>;
}

function DeleteParticipant({ name, onConfirm }: Props) {
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
      const msg = err instanceof Error ? err.message : "Не удалось удалить участника";
      setError(msg);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => handleOpenChange(true)}
        aria-label={`Удалить ${name}`}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        title="Удалить участника?"
        description={`«${name}» и связанные результаты будут удалены безвозвратно.`}
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

export { DeleteParticipant };

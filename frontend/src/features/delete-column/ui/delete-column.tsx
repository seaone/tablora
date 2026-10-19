import { Trash2 } from "lucide-react";
import { useDialogSubmit } from "@/shared/lib";
import { Button, ConfirmDialog } from "@/shared/ui";

interface Props {
  name: string;
  /** Deletion effect injected by the consumer (API call, form-state removal, …). */
  onConfirm: () => void | Promise<void>;
}

function DeleteColumn({ name, onConfirm }: Props) {
  const { isOpen, handleOpenChange, isSubmitting, error, submit } = useDialogSubmit(
    onConfirm,
    "Не удалось удалить столбец",
  );

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => handleOpenChange(true)}
        aria-label={`Удалить столбец ${name}`}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        title="Удалить столбец?"
        description={`«${name}» и связанные результаты будут удалены безвозвратно.`}
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

export { DeleteColumn };

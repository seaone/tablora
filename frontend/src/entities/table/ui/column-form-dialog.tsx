import { type SubmitEvent, useEffect, useState } from "react";
import type { ColumnType } from "@/shared/api";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import { type ColumnDraft, columnSchema } from "../model/column";
import { COLUMN_TYPE_LABELS } from "./column-type-labels";

export interface ColumnFormValue {
  name: string;
  type: ColumnType;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  submittingLabel?: string;
  initialValue?: ColumnFormValue;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (value: ColumnDraft) => void;
}

function ColumnFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  submittingLabel,
  initialValue = { name: "", type: "number" },
  isSubmitting = false,
  error = null,
  onSubmit,
}: Props) {
  const [name, setName] = useState(initialValue.name);
  const [type, setType] = useState<ColumnType>(initialValue.type);
  const [nameSubmitted, setNameSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initialValue.name);
      setType(initialValue.type);
      setNameSubmitted(false);
    }
  }, [open, initialValue.name, initialValue.type]);

  const nameError = (() => {
    const result = columnSchema.safeParse({ name: name.trim(), type });
    if (result.success) {
      return null;
    }
    return result.error.issues.find((issue) => issue.path[0] === "name")?.message ?? null;
  })();

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    setNameSubmitted(true);

    const value: ColumnDraft = { name: name.trim(), type };
    const result = columnSchema.safeParse(value);
    if (!result.success) {
      return;
    }

    onSubmit(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md grid-rows-[auto_minmax(0,1fr)]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="h-full flex flex-col gap-y-4">
          <div className="space-y-4 overflow-y-auto scrollbar-thin -m-1 p-1">
            {error && <FieldError>{error}</FieldError>}

            <Field>
              <FieldLabel htmlFor="column-name">
                Название столбца <span className="text-destructive font-bold">*</span>
              </FieldLabel>
              <Input
                id="column-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Например: Очки"
                autoFocus
              />
              {nameSubmitted && nameError && <FieldError>{nameError}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="column-type">Тип столбца</FieldLabel>
              <Select value={type} onValueChange={(value) => setType(value as ColumnType)}>
                <SelectTrigger id="column-type" className="w-full">
                  <SelectValue placeholder="Тип">{COLUMN_TYPE_LABELS[type]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.entries(COLUMN_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (submittingLabel ?? submitLabel) : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { ColumnFormDialog };

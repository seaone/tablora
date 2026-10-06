import { type SubmitEvent, useEffect, useRef, useState } from "react";
import type { TableColumn } from "@/shared/api";
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
} from "@/shared/ui";
import { type ParticipantDraft, participantSchema } from "../model/participant";
import { ScoreFieldItem } from "./score-field-item";

export interface ParticipantFormValue {
  name: string;
  description: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  submittingLabel?: string;
  initialValue?: ParticipantFormValue;
  isSubmitting?: boolean;
  error?: string | null;
  /** When provided, renders score fields for each column. */
  columns?: TableColumn[];
  initialScores?: Record<string, string>;
  onSubmit: (value: ParticipantDraft, scores?: Record<string, string>) => void;
}

function ParticipantFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  submittingLabel,
  initialValue = { name: "", description: "" },
  isSubmitting = false,
  error = null,
  columns,
  initialScores,
  onSubmit,
}: Props) {
  const [name, setName] = useState(initialValue.name);
  const [descriptionValue, setDescriptionValue] = useState(initialValue.description);
  const [scores, setScores] = useState<Record<string, string>>(initialScores ?? {});
  const [nameSubmitted, setNameSubmitted] = useState(false);

  const prevOpenRef = useRef(open);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setName(initialValue.name);
      setDescriptionValue(initialValue.description);
      setScores(initialScores ?? {});
      setNameSubmitted(false);
    }
    prevOpenRef.current = open;
  }, [open, initialValue.name, initialValue.description, initialScores]);

  const nameError = (() => {
    const result = participantSchema.safeParse({
      name: name.trim(),
      description: descriptionValue.trim() || undefined,
    });
    if (result.success) {
      return null;
    }
    return result.error.issues.find((issue) => issue.path[0] === "name")?.message ?? null;
  })();

  const handleScoreChange = (columnId: string, value: string) => {
    setScores((prev) => ({ ...prev, [columnId]: value }));
  };

  const handleAdjustNumber = (columnId: string, delta: number) => {
    const current = Number(scores[columnId]) || 0;
    const next = Math.max(0, current + delta);
    handleScoreChange(columnId, String(next));
  };

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    setNameSubmitted(true);

    const value: ParticipantDraft = {
      name: name.trim(),
      description: descriptionValue.trim() || undefined,
    };

    const result = participantSchema.safeParse(value);
    if (!result.success) {
      return;
    }

    const hasScores = columns && columns.length > 0;
    onSubmit(value, hasScores ? scores : undefined);
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
              <FieldLabel htmlFor="participant-name">
                Имя участника / название команды{" "}
                <span className="text-destructive font-bold">*</span>
              </FieldLabel>
              <Input
                id="participant-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Например: Иван Иванов или Спартак"
                autoFocus
              />
              {nameSubmitted && nameError && <FieldError>{nameError}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="participant-description">Описание</FieldLabel>
              <Input
                id="participant-description"
                value={descriptionValue}
                onChange={(event) => setDescriptionValue(event.target.value)}
                placeholder="Например: команда или город"
              />
            </Field>

            {columns && columns.length > 0 && (
              <div className="space-y-4">
                {columns.map((col) => (
                  <ScoreFieldItem
                    key={col.id}
                    column={col}
                    value={scores[col.id] ?? ""}
                    onChange={(val) => handleScoreChange(col.id, val)}
                    onAdjustNumber={(delta) => handleAdjustNumber(col.id, delta)}
                    className="border-t pt-4"
                  />
                ))}
              </div>
            )}
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

export { ParticipantFormDialog };

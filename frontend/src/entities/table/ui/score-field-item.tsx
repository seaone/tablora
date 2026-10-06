import { AlignLeft, Clock, Hash, Minus, Plus } from "lucide-react";
import type { TableColumn } from "@/shared/api";
import { cn } from "@/shared/lib";
import { Button, Field, FieldDescription, FieldLabel, Input } from "@/shared/ui";
import { COLUMN_TYPE_LABELS } from "./column-type-labels";

interface Props {
  column: TableColumn;
  value: string;
  onChange: (value: string) => void;
  onAdjustNumber: (delta: number) => void;
  className?: string;
}

function ScoreFieldItem({ column, value, onChange, onAdjustNumber, className }: Props) {
  return (
    <Field className={cn(className, "gap-2")}>
      <div className="flex items-center justify-between">
        <FieldLabel
          htmlFor={`score-${column.id}`}
          className="gap-1.5 text-[11px] font-bold text-foreground uppercase tracking-wider"
        >
          {column.type === "number" && <Hash className="w-3.5 h-3.5 text-primary" />}
          {column.type === "time" && <Clock className="w-3.5 h-3.5 text-emerald-600" />}
          {column.type === "text" && <AlignLeft className="w-3.5 h-3.5 text-muted-foreground" />}
          <span>{column.name}</span>
        </FieldLabel>
        <span className="text-[10px] text-muted-foreground font-semibold uppercase">
          {COLUMN_TYPE_LABELS[column.type]}
        </span>
      </div>

      {column.type === "number" ? (
        <div className="space-y-2">
          <Input
            id={`score-${column.id}`}
            type="number"
            step="any"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0"
          />
          {/* Tactile quick adjust buttons from Stitch */}
          <div className="grid grid-cols-4 gap-1.5">
            <Button type="button" variant="outline" size="sm" onClick={() => onAdjustNumber(-1)}>
              <Minus className="w-3 h-3" /> 1
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => onAdjustNumber(1)}>
              <Plus className="w-3 h-3" /> 1
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => onAdjustNumber(2)}>
              <Plus className="w-3 h-3" /> 2
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => onAdjustNumber(3)}>
              <Plus className="w-3 h-3" /> 3
            </Button>
          </div>
        </div>
      ) : column.type === "time" ? (
        <>
          <Input
            id={`score-${column.id}`}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="01:23.45"
          />
          <FieldDescription className="text-[10px]">Формат: мм:сс или мм:сс.мс</FieldDescription>
        </>
      ) : (
        <Input
          id={`score-${column.id}`}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Заметка или результат"
        />
      )}
    </Field>
  );
}

export { ScoreFieldItem };

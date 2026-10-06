import { GripVertical, Plus } from "lucide-react";
import type { FieldArrayWithId, FieldErrors } from "react-hook-form";
import { COLUMN_TYPE_LABELS, type ColumnDraft } from "@/entities/table";
import { AddColumn } from "@/features/add-column";
import { DeleteColumn } from "@/features/delete-column";
import { EditColumn } from "@/features/edit-column";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  FieldError,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/shared/ui";
import type { CreateTableFormValues } from "../model/create-table";
import { WizardNavigation } from "./wizard-navigation";

interface Props {
  columnFields: FieldArrayWithId<CreateTableFormValues, "columns", "id">[];
  errors: FieldErrors<CreateTableFormValues>;
  onAddColumn: (value: ColumnDraft) => void;
  onUpdateColumn: (index: number, value: ColumnDraft) => void;
  onRemoveColumn: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

function Step2Columns({
  columnFields,
  errors,
  onAddColumn,
  onUpdateColumn,
  onRemoveColumn,
  onNext,
  onPrev,
}: Props) {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold">Столбцы таблицы</CardTitle>
        <p className="text-md text-muted-foreground mt-1">
          Добавь столбцы: очки, время или текстовые заметки
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {columnFields.length > 0 && (
          <ItemGroup>
            {columnFields.map((field, index) => (
              <Item key={field.id} variant="outline" size="sm">
                <ItemMedia>
                  <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 cursor-grab" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{field.name}</ItemTitle>
                  <ItemDescription>{COLUMN_TYPE_LABELS[field.type]}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <EditColumn column={field} onSubmit={(value) => onUpdateColumn(index, value)} />
                  <DeleteColumn name={field.name} onConfirm={() => onRemoveColumn(index)} />
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        )}

        {errors.columns?.root?.message && <FieldError>{errors.columns.root.message}</FieldError>}

        <AddColumn
          onSubmit={onAddColumn}
          triggerLabel="Добавить столбец"
          triggerIcon={<Plus className="w-4 h-4" />}
          className="w-full"
        />
      </CardContent>

      <CardFooter>
        <WizardNavigation
          onPrev={onPrev}
          prevLabel="Назад: Основное"
          onNext={onNext}
          nextLabel="Далее: Участники"
        />
      </CardFooter>
    </>
  );
}

export { Step2Columns };

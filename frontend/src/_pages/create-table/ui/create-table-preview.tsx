import { PreviewTable } from "@/entities/table";
import type { CreateTableFormValues } from "../model/create-table";

interface Props {
  formValues: CreateTableFormValues;
}

function CreateTablePreview({ formValues }: Props) {
  return (
    <PreviewTable
      title={formValues.title.trim() || "Название турнира"}
      description={formValues.description?.trim()}
      columns={formValues.columns.map((col, i) => ({
        name: col.name || `Кол. ${i + 1}`,
      }))}
      participants={formValues.participants.map((part, i) => ({
        name: part.name || `Участник ${i + 1}`,
        description: part.description,
        scores: formValues.columns.map(() => undefined),
      }))}
    />
  );
}

export { CreateTablePreview };

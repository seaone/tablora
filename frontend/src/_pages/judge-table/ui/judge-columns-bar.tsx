import { COLUMN_TYPE_LABELS, type ColumnDraft } from "@/entities/table";
import { DeleteColumn } from "@/features/delete-column";
import { EditColumn } from "@/features/edit-column";
import type { TableColumn } from "@/shared/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/shared/ui";

interface Props {
  columns: TableColumn[];
  onEditColumn: (column: TableColumn, value: ColumnDraft) => void | Promise<void>;
  onDeleteColumn: (column: TableColumn) => void | Promise<void>;
}

function JudgeColumnsBar({ columns, onEditColumn, onDeleteColumn }: Props) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="font-bold">Столбцы</CardTitle>
        <span className="text-xs text-muted-foreground">{columns.length}</span>
      </CardHeader>

      <CardContent>
        {columns.length === 0 ? (
          <p className="text-xs text-muted-foreground">Нет столбцов</p>
        ) : (
          <ItemGroup>
            {columns.map((col) => (
              <Item key={col.id} variant="outline" size="sm">
                <ItemContent>
                  <ItemTitle>{col.name}</ItemTitle>
                  <ItemDescription>{COLUMN_TYPE_LABELS[col.type]}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <EditColumn column={col} onSubmit={(value) => onEditColumn(col, value)} />
                  <DeleteColumn name={col.name} onConfirm={() => onDeleteColumn(col)} />
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  );
}

export { JudgeColumnsBar };

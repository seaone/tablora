"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit3, Eye, ListChecks } from "lucide-react";
import { DeleteTable } from "@/features/delete-table";
import type { MyTableSummary, MyTablesRoleFilter } from "@/shared/api";
import { ACTION_LABELS } from "@/shared/config";
import {
  ActionTooltip,
  Badge,
  buttonVariants,
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";

const ROLE_LABELS: Record<MyTableSummary["role"], string> = {
  owner: "Владелец",
  judge: "Судья",
};

const FILTER_LABELS: Record<MyTablesRoleFilter, string> = {
  all: "Все",
  owner: "Владелец",
  judge: "Судья",
};

function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

interface Props {
  tables: MyTableSummary[];
  /** Deletion effect injected by the page (API call + optimistic removal). */
  onDeleteTable: (id: string) => void | Promise<void>;
}

function MyTablesList({ tables, onDeleteTable }: Props) {
  const [filter, setFilter] = useState<MyTablesRoleFilter>("all");
  const visible = filter === "all" ? tables : tables.filter((table) => table.role === filter);

  if (tables.length === 0) {
    return (
      <div className="max-w-lg mx-auto my-8 flex flex-col items-center gap-4 text-center">
        <ListChecks className="w-10 h-10 text-muted-foreground" aria-hidden="true" />
        <div className="space-y-2">
          <h1 className="font-heading text-xl sm:text-2xl font-bold">Мои таблицы</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            У вас пока нет таблиц. Создайте первую — и она появится здесь.
          </p>
        </div>
        <Link href="/new" className={buttonVariants({ variant: "default", size: "default" })}>
          Создать таблицу
        </Link>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl sm:text-2xl font-bold">Мои таблицы</CardTitle>
        <CardAction>
          <Select value={filter} onValueChange={(value) => setFilter(value as MyTablesRoleFilter)}>
            <SelectTrigger aria-label="Фильтр по роли">
              <SelectValue>{FILTER_LABELS[filter]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{FILTER_LABELS.all}</SelectItem>
              <SelectItem value="owner">{FILTER_LABELS.owner}</SelectItem>
              <SelectItem value="judge">{FILTER_LABELS.judge}</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent>
        {visible.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Нет таблиц с этой ролью.
          </p>
        ) : (
          <ItemGroup>
            {visible.map((table) => (
              <Item key={table.id} variant="card" size="sm" className="items-start">
                <ItemContent>
                  <ItemTitle>
                    {table.title}
                    <Badge variant={table.role === "owner" ? "default" : "secondary"}>
                      {ROLE_LABELS[table.role]}
                    </Badge>
                  </ItemTitle>
                  {table.description ? (
                    <ItemDescription>{table.description}</ItemDescription>
                  ) : null}
                  <ItemDescription>{formatCreatedAt(table.createdAt)}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <ActionTooltip
                    label={ACTION_LABELS.viewTable}
                    trigger={
                      <Link
                        href={`/t/${table.id}/`}
                        className={buttonVariants({ variant: "ghost", size: "icon" })}
                      >
                        <Eye className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    }
                  />
                  <ActionTooltip
                    label={ACTION_LABELS.editTable}
                    trigger={
                      <Link
                        href={`/t/${table.id}/edit`}
                        className={buttonVariants({ variant: "ghost", size: "icon" })}
                      >
                        <Edit3 className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    }
                  />
                  {table.role === "owner" ? (
                    <DeleteTable
                      onConfirm={() => onDeleteTable(table.id)}
                      variant="ghost"
                      size="icon"
                    />
                  ) : null}
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  );
}

export { MyTablesList };

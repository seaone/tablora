"use client";

import { useState } from "react";
import Link from "next/link";
import { ListChecks } from "lucide-react";
import type { MyTableSummary, MyTablesRoleFilter } from "@/shared/api";
import {
  Badge,
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
}

function MyTablesList({ tables }: Props) {
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-xl sm:text-2xl font-bold">Мои таблицы</h1>
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
      </div>

      {visible.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Нет таблиц с этой ролью.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visible.map((table) => (
            <Card key={table.id} size="sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link
                    href={`/t/${table.id}/edit`}
                    className="hover:text-primary hover:underline underline-offset-4 transition-colors"
                  >
                    {table.title}
                  </Link>
                  <Badge variant={table.role === "owner" ? "default" : "secondary"}>
                    {ROLE_LABELS[table.role]}
                  </Badge>
                </CardTitle>
                {table.description ? (
                  <CardDescription className="line-clamp-2">{table.description}</CardDescription>
                ) : null}
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  Создана {formatCreatedAt(table.createdAt)}
                </span>
                <Link
                  href={`/t/${table.id}/edit`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Открыть
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export { MyTablesList };

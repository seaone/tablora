"use client";

import { Trash2, UserPlus } from "lucide-react";
import { type FormEvent, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Loader,
} from "@/shared/ui";
import { useTableJudges } from "../model/use-table-judges";

interface Props {
  tableId: string;
}

function ShareJudgesCard({ tableId }: Props) {
  const { judges, loading, addJudge, removeJudge } = useTableJudges(tableId, true);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await addJudge(email.trim());
      setEmail("");
    } catch {
      setError("Не удалось добавить судью. Проверьте адрес.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold">Судьи</CardTitle>
        <CardDescription className="text-xs sm:text-sm leading-relaxed">
          Добавьте судей по email от Яндекс ID — они смогут вносить и изменять результаты.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="судья@example.com"
            required
            className="flex-1"
          />
          <Button type="submit" variant="default" disabled={submitting}>
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            <span>Добавить</span>
          </Button>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {loading ? (
          <Loader label="Загрузка судей..." />
        ) : judges.length === 0 ? (
          <p className="text-sm text-muted-foreground">Пока нет добавленных судей.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {judges.map((judge) => (
              <li
                key={judge.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
              >
                <span className="text-sm truncate">{judge.email}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => void removeJudge(judge.id)}
                  title="Удалить судью"
                >
                  <Trash2 className="w-4 h-4 text-destructive" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export { ShareJudgesCard };

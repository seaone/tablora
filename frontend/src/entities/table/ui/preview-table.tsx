import { Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui";

export interface PreviewTableColumn {
  id?: string;
  name: string;
}

export interface PreviewTableParticipant {
  id?: string;
  name: string;
  description?: string | null;
  scores: Array<string | undefined>;
}

interface Props {
  title: string;
  description?: string | null;
  columns: PreviewTableColumn[];
  participants: PreviewTableParticipant[];
  limit?: number;
  className?: string;
}

const EMPTY_DESCRIPTION = "Описание турнира не заполнено";

function PreviewTable({ title, description, columns, participants, limit, className }: Props) {
  const visibleParticipants = limit ? participants.slice(0, limit) : participants;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-semibold">
          <Eye className="w-4 h-4" />
          <span>Превью таблицы</span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-1.5 mb-5">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description || EMPTY_DESCRIPTION}</CardDescription>
        </div>

        {/* Live table preview container */}
        <div className="rounded-lg border border-border/50 overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/80 text-muted-foreground border-b border-border/50 font-semibold">
                  <th className="py-2.5 px-3 w-10 text-center text-muted-foreground">#</th>
                  <th className="py-2.5 px-3 text-muted-foreground">Участник</th>
                  {columns.map((col, i) => (
                    <th
                      key={col.id ?? i}
                      className="py-2.5 px-3 text-center text-muted-foreground font-bold bg-primary/5"
                    >
                      {col.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-scoreboard">
                {visibleParticipants.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2 + columns.length}
                      className="py-6 text-center text-muted-foreground text-xs"
                    >
                      Нет участников
                    </td>
                  </tr>
                ) : (
                  visibleParticipants.map((part, idx) => (
                    <tr key={part.id ?? idx} className={idx % 2 === 1 ? "bg-muted/50" : ""}>
                      <td className="py-2.5 px-3 text-center text-muted-foreground font-bold">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-sans max-w-30">
                        <div className="font-semibold text-foreground truncate">{part.name}</div>
                        {part.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {part.description}
                          </div>
                        )}
                      </td>
                      {columns.map((col, cIdx) => (
                        <td
                          key={col.id ?? cIdx}
                          className="py-2.5 px-3 text-center text-muted-foreground bg-primary/5"
                        >
                          {part.scores[cIdx] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export type { Props };
export { PreviewTable };

"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type React from "react";
import { type HTMLAttributes, useMemo } from "react";
import type { FullTableData, Participant } from "@/shared/api";
import { cn } from "@/shared/lib";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui";
import type { SortDirection } from "../model/use-spectator-table";

interface StandingsTableProps {
  className?: HTMLAttributes<HTMLElement>["className"];
  table: FullTableData;
  sortedParticipants: Participant[];
  sortColumnId: string | null;
  sortDirection: SortDirection;
  onSort: (columnId: string) => void;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  className,
  table,
  sortedParticipants,
  sortColumnId,
  sortDirection,
  onSort,
}) => {
  const scoreByCell = useMemo(() => {
    const map = new Map<string, string>();
    for (const score of table.scores) {
      map.set(`${score.participantId}:${score.columnId}`, score.value);
    }
    return map;
  }, [table.scores]);

  const renderRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold font-scoreboard text-[14px] border border-amber-300">
          1
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold font-scoreboard text-[14px] border border-slate-300">
          2
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/15 text-amber-900 font-bold font-scoreboard text-[14px] border border-amber-600/30">
          3
        </div>
      );
    }
    return (
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold font-scoreboard text-[14px]">
        {index + 1}
      </div>
    );
  };

  return (
    <section className={cn("flex flex-col gap-6", className)}>
      {/* Table Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            {table.title}
          </CardTitle>
          {table.description && (
            <CardDescription className="text-xs sm:text-sm leading-relaxed">
              {table.description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      {/* Table Container */}
      <div className="bg-card rounded-lg border border-border overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted border-b border-border text-xs font-bold text-muted-foreground tracking-wider uppercase">
                <th className="py-4 px-4 w-16 text-center">МЕСТО</th>
                <th className="py-4 px-4 min-w-50">УЧАСТНИК / КОМАНДА</th>

                {table.columns.map((col) => {
                  const isSorted = sortColumnId === col.id;
                  return (
                    <th
                      key={col.id}
                      onClick={() => onSort(col.id)}
                      className={`py-4 px-4 text-center cursor-pointer transition-colors select-none hover:bg-muted ${
                        isSorted ? "bg-primary/10 font-extrabold" : ""
                      }`}
                    >
                      <div className="inline-flex items-center gap-1.5 justify-center">
                        <span>{col.name}</span>
                        {isSorted ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-primary" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-muted-foreground opacity-60" />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-border/50 font-sans text-sm">
              {sortedParticipants.length === 0 ? (
                <tr>
                  <td
                    colSpan={2 + table.columns.length}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    Нет участников в таблице
                  </td>
                </tr>
              ) : (
                sortedParticipants.map((participant, index) => (
                  <tr
                    key={participant.id}
                    className={`transition-colors hover:bg-muted/50 ${
                      index % 2 === 1 ? "bg-muted/20" : ""
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-4 px-4 text-center">{renderRankBadge(index)}</td>

                    {/* Participant Name */}
                    <td className="py-4 px-4 text-foreground text-sm sm:text-base">
                      <div className="flex items-center gap-2 font-semibold">
                        <span>{participant.name}</span>
                      </div>
                      {participant.description && (
                        <div className="text-xs text-muted-foreground">
                          {participant.description}
                        </div>
                      )}
                    </td>

                    {/* Score Columns */}
                    {table.columns.map((col) => {
                      const val = scoreByCell.get(`${participant.id}:${col.id}`) ?? "";
                      const isSorted = sortColumnId === col.id;

                      return (
                        <td
                          key={col.id}
                          className={`py-4 px-4 text-center font-scoreboard text-sm sm:text-base ${
                            val !== ""
                              ? isSorted
                                ? "font-bold"
                                : "font-semibold text-foreground"
                              : "text-muted-foreground"
                          } ${isSorted ? "bg-primary/5" : ""}`}
                        >
                          {val !== "" ? val : "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

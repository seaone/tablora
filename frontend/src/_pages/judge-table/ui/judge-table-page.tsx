"use client";

import { AddColumn } from "@/features/add-column";
import { AddParticipant } from "@/features/add-participant";
import {
  Badge,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  ItemGroup,
  Loader,
  Main,
  Page,
} from "@/shared/ui";
import { useJudgeTable } from "../model/use-judge-table";
import { JudgeColumnsBar } from "./judge-columns-bar";
import { JudgeParticipantCard } from "./judge-participant-card";
import { JudgeQuickActions } from "./judge-quick-actions";
import { JudgeTableHeader } from "./judge-table-header";

interface Props {
  tableId: string;
}

function JudgeTablePage({ tableId }: Props) {
  const {
    table,
    status,
    searchQuery,
    setSearchQuery,
    filteredParticipants,
    handleAddColumn,
    handleUpdateColumn,
    handleAddParticipant,
    handleUpdateParticipant,
    handleDeleteColumn,
    handleDeleteParticipant,
  } = useJudgeTable(tableId);

  if (!table) {
    return <Loader label="Загрузка таблицы..." />;
  }

  return (
    <Page>
      {/* Sticky Mobile/Desktop Header matching Stitch judge_mobile_list */}
      <JudgeTableHeader tableId={tableId} tableTitle={table.title} status={status} />

      {/* Main Container */}
      <Main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-8 space-y-4">
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

          <Card>
            <CardHeader>
              <CardTitle className="font-bold">Участники и команды</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по имени участника..."
              />

              {/* Participant List matching Stitch judge_mobile_list */}
              {filteredParticipants.length === 0 ? (
                <div className="p-8 text-center rounded-lg bg-card border border-border text-sm text-muted-foreground">
                  {searchQuery ? "Ничего не найдено" : "Нет участников в таблице"}
                </div>
              ) : (
                <ItemGroup>
                  {filteredParticipants.map((participant, index) => (
                    <JudgeParticipantCard
                      key={participant.id}
                      participant={participant}
                      index={index}
                      columns={table.columns}
                      scores={table.scores}
                      onEditParticipant={handleUpdateParticipant}
                      onDeleteParticipant={handleDeleteParticipant}
                    />
                  ))}
                </ItemGroup>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="lg:col-span-4 space-y-4">
          {/* Quick Actions Bar (+ Участник, + Столбец) */}
          <JudgeQuickActions>
            <AddParticipant onSubmit={handleAddParticipant} />
            <AddColumn onSubmit={handleAddColumn} />
          </JudgeQuickActions>

          {/* Columns management (edit + delete) */}
          <JudgeColumnsBar
            columns={table.columns}
            onEditColumn={handleUpdateColumn}
            onDeleteColumn={handleDeleteColumn}
          />
        </section>
      </Main>
    </Page>
  );
}

export { JudgeTablePage };

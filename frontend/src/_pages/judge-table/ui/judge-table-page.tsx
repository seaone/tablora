"use client";

import { AddColumn } from "@/features/add-column";
import { AddParticipant } from "@/features/add-participant";
import { AccessDeniedNotice } from "@/entities/user";
import { SignInNotice } from "@/features/account";
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
import { useJudgeAccess } from "../model/use-judge-access";
import { useJudgeTable } from "../model/use-judge-table";
import { JudgeColumnsBar } from "./judge-columns-bar";
import { JudgeParticipantCard } from "./judge-participant-card";
import { JudgeQuickActions } from "./judge-quick-actions";
import { JudgeTableHeader } from "./judge-table-header";

interface Props {
  tableId: string;
}

function JudgeTablePage({ tableId }: Props) {
  const { user, authLoading, loading: accessLoading, isEditor, role } = useJudgeAccess(tableId);
  const {
    table,
    status,
    searchQuery,
    setSearchQuery,
    filteredParticipants,
    handleAddColumn,
    handleUpdateColumn,
    handleDeleteTable,
    handleAddParticipant,
    handleUpdateParticipant,
    handleDeleteColumn,
    handleDeleteParticipant,
  } = useJudgeTable(tableId);

  return (
    <Page>
      {/* Sticky Mobile/Desktop Header matching Stitch judge_mobile_list */}
      <JudgeTableHeader
        tableId={tableId}
        status={status}
        isOwner={role === "owner"}
        onDeleteTable={handleDeleteTable}
      />

      {/* Main Container */}
      <Main className="flex-1">
        {(authLoading || accessLoading) && <Loader label="Проверка доступа..." />}

        {!(authLoading || accessLoading) && !user && (
          <SignInNotice
            title="Редактирование таблицы"
            description="Войдите, чтобы вносить и изменять результаты."
          />
        )}

        {user && !isEditor && <AccessDeniedNotice />}

        {isEditor && !table && <Loader label="Загрузка таблицы..." />}

        {isEditor && table && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
          </div>
        )}
      </Main>
    </Page>
  );
}

export { JudgeTablePage };

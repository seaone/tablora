"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Footer,
  Loader,
  Main,
  Page,
} from "@/shared/ui";
import { useTableShare } from "../model/use-table-share";
import { ShareAccessCards } from "./share-access-cards";
import { ShareJudgesCard } from "./share-judges-card";
import { ShareTableHeader } from "./share-table-header";
import { ShareTablePreview } from "./share-table-preview";

interface Props {
  tableId: string;
}

function ShareTablePage({ tableId }: Props) {
  const {
    table,
    role,
    loading,
    copiedJudge,
    copiedSpectator,
    judgeUrl,
    spectatorUrl,
    copyToClipboard,
  } = useTableShare(tableId);

  return (
    <Page>
      {/* Top Header & Completed Stepper matching Stitch */}
      <ShareTableHeader />

      {/* Main Two-Column Content Canvas matching Stitch */}
      <Main className="flex-1">
        {loading && <Loader label="Загрузка данных..." />}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Confirmation & Access Cards (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <Card>
                {/* Success Banner */}
                <CardContent>
                  <div className="p-4 rounded-lg bg-emerald-600/10 border border-emerald-600/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-emerald-600 text-white self-start flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </span>
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-foreground">
                          Турнир успешно опубликован и готов к работе
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Title & Description */}
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                    Доступ и управление таблицей
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm leading-relaxed">
                    Таблица активирована. Отправьте ссылку или покажите QR-код судьям для ввода
                    счета, а зрителям — для онлайн-просмотра live-результатов.
                  </CardDescription>
                </CardHeader>

                {/* 2 Access Cards: Judge & Spectator */}
                <CardContent>
                  <ShareAccessCards
                    tableId={tableId}
                    judgeUrl={judgeUrl}
                    spectatorUrl={spectatorUrl}
                    copiedJudge={copiedJudge}
                    copiedSpectator={copiedSpectator}
                    onCopy={copyToClipboard}
                  />
                </CardContent>
              </Card>

              {role === "owner" && <ShareJudgesCard tableId={tableId} />}
            </div>

            {/* Right Column: Live Table Preview (5 cols) matching Stitch */}
            <div className="lg:col-span-5">{table && <ShareTablePreview table={table} />}</div>
          </div>
        )}
      </Main>

      {/* Minimal Footer matching Stitch */}
      <Footer>
        <Link
          href="/"
          className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          Главная
        </Link>
      </Footer>
    </Page>
  );
}

export { ShareTablePage };

"use client";

import Link from "next/link";
import { Footer, Loader, Main, Page } from "@/shared/ui";
import { useSpectatorTable } from "../model/use-spectator-table";
import { AudienceQrWidget } from "./audience-qr-widget";
import { SpectatorHeader } from "./spectator-header";
import { StandingsTable } from "./standings-table";

interface Props {
  tableId: string;
}

function SpectatorTablePage({ tableId }: Props) {
  const {
    table,
    status,
    sortColumnId,
    sortDirection,
    handleSort,
    sortedParticipants,
    isFullscreen,
    toggleFullScreen,
    spectatorUrl,
  } = useSpectatorTable(tableId);

  if (!table) {
    return <Loader label="Загрузка таблицы..." />;
  }

  return (
    <Page>
      {/* Top Header matching Stitch spectator_live */}
      <SpectatorHeader
        tableId={tableId}
        status={status}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullScreen}
      />

      {/* Main Presentation Grid: 8 cols Standings + 4 cols QR widget */}
      <Main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <StandingsTable
          className="lg:col-span-8"
          table={table}
          sortedParticipants={sortedParticipants}
          sortColumnId={sortColumnId}
          sortDirection={sortDirection}
          onSort={handleSort}
        />

        <AudienceQrWidget className="lg:col-span-4" spectatorUrl={spectatorUrl} />
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

export { SpectatorTablePage };

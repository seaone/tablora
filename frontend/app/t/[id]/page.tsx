import { SpectatorTablePage } from "@/_pages/table-spectator";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Таблора — Результаты в реальном времени",
  description: "Онлайн-табло соревнований с обновлением результатов",
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <SpectatorTablePage tableId={id} />;
}

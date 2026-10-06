import { JudgeTablePage } from "@/_pages/judge-table";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Таблора — Судейская панель",
  description: "Интерфейс судейства соревнований",
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <JudgeTablePage tableId={id} />;
}

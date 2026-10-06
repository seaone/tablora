import { CreateTablePage } from "@/_pages/create-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Таблора — Создать турнирную таблицу",
  description: "Создание таблицы соревнований с генерацией QR-кодов для судей и зрителей",
};

export default function Page() {
  return <CreateTablePage />;
}

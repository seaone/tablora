import { MyTablesPage } from "@/_pages/my-tables";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Таблора — Мои таблицы",
  description: "Таблицы, которыми вы владеете или которые судите",
};

export default function Page() {
  return <MyTablesPage />;
}

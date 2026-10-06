import { ShareTablePage } from "@/_pages/share-table";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Таблора — Доступ и QR-коды",
  description: "QR-коды для судей и зрительского онлайн-табло",
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ShareTablePage tableId={id} />;
}

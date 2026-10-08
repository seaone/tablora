"use client";

import Link from "next/link";
import { useAuth } from "@/entities/user";
import { SignInNotice } from "@/features/account";
import { Footer, Loader, Main, Page } from "@/shared/ui";
import { CreateTableHeader } from "./create-table-header";
import { CreateTableWizard } from "./create-table-wizard";

function CreateTablePage() {
  const { user, loading } = useAuth();

  return (
    <Page>
      {/* TOP HEADER / WIZARD APP BAR matching Stitch */}
      <CreateTableHeader />

      {/* MAIN CANVAS */}
      <Main className="flex-1">
        {loading ? (
          <Loader label="Проверка доступа..." />
        ) : user ? (
          <CreateTableWizard />
        ) : (
          <SignInNotice
            title="Создание таблицы"
            description="Войдите, чтобы создать турнирную таблицу."
          />
        )}
      </Main>

      {/* MINIMAL FOOTER matching Stitch */}
      <Footer>
        <Link
          href="/"
          className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          На главную
        </Link>
      </Footer>
    </Page>
  );
}

export { CreateTablePage };

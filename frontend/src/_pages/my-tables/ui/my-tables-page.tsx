"use client";

import Link from "next/link";
import { SignInNotice } from "@/features/account";
import { Footer, Loader, Main, Page } from "@/shared/ui";
import { useMyTables } from "../model/use-my-tables";
import { MyTablesHeader } from "./my-tables-header";
import { MyTablesList } from "./my-tables-list";

function MyTablesPage() {
  const { tables, loading, error, authLoading, authed, deleteTable } = useMyTables();

  return (
    <Page>
      <MyTablesHeader />

      <Main className="flex-1">
        {authLoading ? (
          <Loader label="Загрузка..." />
        ) : !authed ? (
          <SignInNotice title="Мои таблицы" description="Войдите, чтобы увидеть свои таблицы." />
        ) : loading ? (
          <Loader label="Загрузка таблиц..." />
        ) : error ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Не удалось загрузить таблицы. Попробуйте обновить страницу.
          </p>
        ) : (
          <MyTablesList tables={tables} onDeleteTable={deleteTable} />
        )}
      </Main>

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

export { MyTablesPage };

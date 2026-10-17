"use client";

import { AccountControl } from "@/features/account";
import { Header } from "@/shared/ui";

function CreateTableHeader() {
  return (
    <Header
      subtitle={
        <span className="text-xs sm:text-sm font-medium text-foreground">Создание таблицы</span>
      }
      rightContent={<AccountControl />}
    />
  );
}

export { CreateTableHeader };

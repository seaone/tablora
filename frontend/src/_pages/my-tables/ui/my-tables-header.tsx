import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { AccountControl } from "@/features/account";
import { ACTION_LABELS } from "@/shared/config";
import { ActionTooltip, Header, buttonVariants } from "@/shared/ui";

function MyTablesHeader() {
  return (
    <Header
      subtitle={<span className="text-xs sm:text-sm font-medium text-foreground">Мои таблицы</span>}
      rightContent={
        <>
          <ActionTooltip
            label={ACTION_LABELS.createTable}
            trigger={
              <Link href="/new" className={buttonVariants({ variant: "default", size: "icon" })}>
                <PlusCircle className="w-4 h-4" aria-hidden="true" />
              </Link>
            }
          />
          <AccountControl />
        </>
      }
    />
  );
}

export { MyTablesHeader };

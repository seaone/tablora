import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { AccountControl } from "@/features/account";
import { Header, buttonVariants } from "@/shared/ui";
import { useMediaQuery } from "@/shared/lib";

function MyTablesHeader() {
  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <Header
      subtitle={<span className="text-xs sm:text-sm font-medium text-foreground">Мои таблицы</span>}
      rightContent={
        <>
          <Link
            href="/new"
            className={buttonVariants({ variant: "default", size: isMobile ? "icon" : "default" })}
          >
            <PlusCircle className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Создать таблицу</span>
          </Link>
          <AccountControl />
        </>
      }
    />
  );
}

export { MyTablesHeader };

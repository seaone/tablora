"use client";

import { AccountControl } from "@/features/account";
import { useMediaQuery } from "@/shared/lib";
import { buttonVariants, Header } from "@/shared/ui";
import Link from "next/link";

function CreateTableHeader() {
  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <Header
      subtitle={
        <span className="text-xs sm:text-sm font-medium text-foreground">
          Мастер создания турнира
        </span>
      }
      rightContent={
        <>
          <Link
            href="/"
            className={buttonVariants({ variant: "outline", size: isMobile ? "icon" : "default" })}
          >
            <span className="hidden sm:inline">На главную</span>
          </Link>
          <AccountControl />
        </>
      }
    />
  );
}

export { CreateTableHeader };

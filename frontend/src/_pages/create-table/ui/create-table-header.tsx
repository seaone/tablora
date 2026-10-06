"use client";

import { useMediaQuery } from "@/shared/lib";
import { buttonVariants, Header } from "@/shared/ui";
import { X } from "lucide-react";
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
        <Link
          href="/"
          className={buttonVariants({ variant: "outline", size: isMobile ? "icon" : "default" })}
        >
          <X className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Выйти</span>
        </Link>
      }
    />
  );
}

export { CreateTableHeader };

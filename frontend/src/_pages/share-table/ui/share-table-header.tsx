import Link from "next/link";
import { Check, X } from "lucide-react";
import { Header, buttonVariants } from "@/shared/ui";
import { useMediaQuery } from "@/shared/lib";

function ShareTableHeader() {
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

export { ShareTableHeader };

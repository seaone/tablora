import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { AccountControl } from "@/features/account";
import { Header, buttonVariants } from "@/shared/ui";
import { useMediaQuery } from "@/shared/lib";

function HomeHeader() {
  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <Header
      className="z-50"
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

export { HomeHeader };

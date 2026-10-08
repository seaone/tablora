import Link from "next/link";
import { AccountControl } from "@/features/account";
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

export { ShareTableHeader };

"use client";

import { LogIn, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/entities/user";
import { useMediaQuery } from "@/shared/lib";
import { Button } from "@/shared/ui";
import { SignInDialog } from "./sign-in-dialog";

function AccountControl() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [signInOpen, setSignInOpen] = useState(false);

  if (loading) {
    return <span className="inline-block w-20 h-8" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          size={isMobile ? "icon" : "default"}
          onClick={() => setSignInOpen(true)}
        >
          <LogIn className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Войти</span>
        </Button>
        <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} returnTo={pathname} />
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline text-sm text-muted-foreground max-w-40 truncate">
        {user.displayName}
      </span>
      <Button
        type="button"
        variant="outline"
        size={isMobile ? "icon" : "default"}
        onClick={() => void signOut()}
        title="Выйти"
      >
        <LogOut className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">Выйти</span>
      </Button>
    </div>
  );
}

export { AccountControl };

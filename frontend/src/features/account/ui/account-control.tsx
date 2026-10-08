"use client";

import { LogIn, LogOut, Table2, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/entities/user";
import { useMediaQuery } from "@/shared/lib";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/ui";
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
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="icon" title={user.displayName}>
            <UserIcon className="w-4 h-4" aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-48 max-w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">
            {user.displayName}
            <br />
            {user.email}
          </DropdownMenuLabel>
          <DropdownMenuItem render={<Link href="/my" />}>
            <Table2 className="w-4 h-4" aria-hidden="true" />
            Мои таблицы
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void signOut()} variant="destructive">
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Выйти
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { AccountControl };

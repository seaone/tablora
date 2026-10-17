"use client";

import { LogIn, LogOut, Table2, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/entities/user";
import { ACTION_LABELS } from "@/shared/config";
import {
  ActionTooltip,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Spinner,
} from "@/shared/ui";
import { SignInDialog } from "./sign-in-dialog";

function AccountControl() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const [signInOpen, setSignInOpen] = useState(false);

  if (loading) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled
        aria-busy="true"
        aria-label="Загрузка"
      >
        <Spinner />
      </Button>
    );
  }

  if (!user) {
    return (
      <>
        <ActionTooltip
          label={ACTION_LABELS.signIn}
          trigger={
            <Button type="button" variant="outline" size="icon" onClick={() => setSignInOpen(true)}>
              <LogIn className="w-4 h-4" aria-hidden="true" />
            </Button>
          }
        />
        <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} returnTo={pathname} />
      </>
    );
  }

  return (
    <DropdownMenu>
      <ActionTooltip
        label={ACTION_LABELS.accountMenu}
        trigger={
          <DropdownMenuTrigger
            aria-label={user.displayName}
            render={
              <Button variant="outline" size="icon" title={user.displayName}>
                <UserIcon className="w-4 h-4" aria-hidden="true" />
              </Button>
            }
          />
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

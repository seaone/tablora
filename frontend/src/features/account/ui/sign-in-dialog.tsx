"use client";

import { LogIn } from "lucide-react";
import { AUTH_PROVIDERS, type AuthProvider } from "@tablora/shared";
import { signInUrl } from "@/shared/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  buttonVariants,
} from "@/shared/ui";

/** Presentation for each supported provider. Keys must cover every AuthProvider. */
const PROVIDER_LABELS: Record<AuthProvider, string> = {
  yandex: "Яндекс ID",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Path to return to after sign-in (usually the current page). */
  returnTo?: string;
}

function SignInDialog({ open, onOpenChange, returnTo }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Вход</DialogTitle>
          <DialogDescription>Выберите сервис, через который хотите войти.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {AUTH_PROVIDERS.map((provider) => (
            <a
              key={provider}
              href={signInUrl(provider, returnTo)}
              className={buttonVariants({ variant: "outline", size: "lg", className: "w-full" })}
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>Войти через {PROVIDER_LABELS[provider]}</span>
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { SignInDialog };

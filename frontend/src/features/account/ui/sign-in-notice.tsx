"use client";

import { LogIn } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui";
import { SignInDialog } from "./sign-in-dialog";

interface Props {
  title?: string;
  description?: string;
}

function SignInNotice({
  title = "Войдите",
  description = "Войдите через один из сервисов, чтобы продолжить.",
}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button type="button" variant="default" size="lg" onClick={() => setOpen(true)}>
          <LogIn className="w-4 h-4" aria-hidden="true" />
          <span>Войти</span>
        </Button>
        <SignInDialog open={open} onOpenChange={setOpen} returnTo={pathname} />
      </CardContent>
    </Card>
  );
}

export { SignInNotice };

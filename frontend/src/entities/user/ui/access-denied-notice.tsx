import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  buttonVariants,
} from "@/shared/ui";

function AccessDeniedNotice() {
  return (
    <Card className="max-w-lg mx-auto my-8">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-destructive" aria-hidden="true" />
          Доступ запрещён
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          У вас нет прав на редактирование этой таблицы. Попросите организатора добавить вас в
          список судей.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/" className={buttonVariants({ variant: "outline", size: "default" })}>
          На главную
        </Link>
      </CardContent>
    </Card>
  );
}

export { AccessDeniedNotice };

import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/shared/ui";

function HomeHero() {
  return (
    <div className="lg:col-span-6 space-y-6">
      <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight font-heading">
        Результаты соревнований <span className="text-primary">без лишней суеты</span>
      </h1>

      <div className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
        <p>
          Таблора — веб-приложение для турнирных таблиц и результатов соревнований.
          <br />
          Организатор создаёт таблицу результатов и получает ссылки на таблицы:
        </p>
        <ul className="list-disc ml-4">
          <li>судейскую таблицу — для ввода баллов со смартфона;</li>
          <li>таблицу для зрителей, которая в реальном времени отображает результаты на экране.</li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <Link href="/new" className={buttonVariants({ variant: "default", size: "lg" })}>
          <PlusCircle className="w-4 h-4" />
          <span>Создать таблицу</span>
        </Link>
      </div>
    </div>
  );
}

export { HomeHero };

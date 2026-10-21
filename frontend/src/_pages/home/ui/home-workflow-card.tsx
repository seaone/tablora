"use client";

import { Edit3, QrCode, Radio, Sliders } from "lucide-react";
import { Card, CardContent } from "@/shared/ui";

const STEPS = [
  {
    icon: Sliders,
    title: "Создай таблицу",
    description: "Введи название турнира, настрой столбцы и добавь участников.",
  },
  {
    icon: QrCode,
    title: "Поделись QR-кодом",
    description:
      "Судьи сканируют код и сразу переходят к заполнению результатов со своих устройств.",
  },
  {
    icon: Edit3,
    title: "Быстрый ввод",
    description: "Ввод очков, голов и времени занимает пару касаний.",
  },
  {
    icon: Radio,
    title: "Результаты в реальном времени",
    description: "Мгновенная синхронизация со всеми экранами и устройствами зрителей.",
  },
];

function HomeWorkflowCard() {
  return (
    <Card className="lg:col-span-6">
      <CardContent className="gap-8">
        {STEPS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/25 text-primary-foreground/75 shadow-xs">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <div className="pt-0.5">
              <h3 className="text-sm font-bold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export { HomeWorkflowCard };

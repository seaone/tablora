"use client";

import { Sliders, QrCode, Edit3, Radio } from "lucide-react";

function HomeWorkflowCard() {
  return (
    <div className="lg:col-span-6">
      <div className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-foreground leading-tight">
              Как пользоваться сервисом
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">4 простых шага</p>
          </div>
        </div>

        <div className="grid grid-rows-[repeat(4,1fr)] gap-y-4">
          {/* Step 1 */}
          <div className="flex items-start gap-4 group">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-lg bg-primary/25 text-primary-foreground/75 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ">
                <Sliders className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-0.5">
              <h4 className="text-sm font-bold text-foreground">Создай таблицу</h4>
              <p className="text-xs text-muted-foreground">
                Введи название турнира, настрой столбцы и добавь участников.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4 group">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-lg bg-primary/25 text-primary-foreground/75 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ">
                <QrCode className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-0.5">
              <h4 className="text-sm font-bold text-foreground">Поделись QR-кодом</h4>
              <p className="text-xs text-muted-foreground">
                Судьи сканируют код и сразу переходят к заполнению результатов со своих устройств.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4 group">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-lg bg-primary/25 text-primary-foreground/75 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ">
                <Edit3 className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-0.5">
              <h4 className="text-sm font-bold text-foreground">Быстрый ввод</h4>
              <p className="text-xs text-muted-foreground">
                Ввод очков, голов и времени занимает пару касаний.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-4 group">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-lg bg-primary/25 text-primary-foreground/75 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ">
                <Radio className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-0.5">
              <h4 className="text-sm font-bold text-foreground">Результаты в реальном времени</h4>
              <p className="text-xs text-muted-foreground">
                Мгновенная синхронизация со всеми экранами и устройствами зрителей.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { HomeWorkflowCard };

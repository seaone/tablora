import { Check } from "lucide-react";
import React from "react";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui";
import type { CreateTableFormValues, WizardStep } from "../model/create-table";

interface Props {
  currentStep: WizardStep;
  formValues?: CreateTableFormValues;
  onSelectStep: (step: WizardStep) => void;
}

const STEPS: { step: WizardStep; label: string }[] = [
  { step: 1, label: "Основное" },
  { step: 2, label: "Столбцы" },
  { step: 3, label: "Участники" },
  { step: 4, label: "Подтверждение" },
];

function WizardStepper({ currentStep, onSelectStep }: Props) {
  return (
    <nav aria-label="Прогресс" className="flex items-center justify-center flex-wrap gap-2 mb-8">
      {STEPS.map(({ step, label }, i) => {
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;
        const isFuture = step > currentStep;

        return (
          <React.Fragment key={step}>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              disabled={isFuture}
              onClick={isCompleted ? () => onSelectStep(step) : undefined}
              aria-current={isCurrent ? "step" : undefined}
              title={
                isCompleted
                  ? `Вернуться к шагу ${step}: ${label}`
                  : isCurrent
                    ? `Текущий шаг ${step}: ${label}`
                    : `Шаг ${step}: ${label} (недоступен)`
              }
            >
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 transition-colors",
                  isCurrent && "bg-primary text-white",
                  isCompleted && "bg-secondary text-white",
                  isFuture && "bg-accent text-muted-foreground/60",
                )}
              >
                {isCompleted ? <Check className="w-3 h-3 stroke-[2.5]" /> : step}
              </span>
              <span>{label}</span>
            </Button>

            {i < STEPS.length - 1 && (
              <span className="text-muted-foreground text-xs select-none" aria-hidden="true">
                ›
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export { WizardStepper };

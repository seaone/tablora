import { CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/ui";
import type { CreateTableFormValues } from "../model/create-table";
import { WizardNavigation } from "./wizard-navigation";

interface Props {
  formValues: CreateTableFormValues;
  isSubmitting: boolean;
  onPrev: () => void;
  onSubmit: () => void;
}

function Step4Review({ formValues, isSubmitting, onPrev, onSubmit }: Props) {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold">Подтверждение и публикация</CardTitle>
        <p className="text-md text-muted-foreground mt-1">
          Проверь данные турнира перед созданием таблицы
        </p>
      </CardHeader>

      <CardContent>
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
          <h3 className="font-bold text-foreground text-base">{formValues.title}</h3>
          {formValues.description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {formValues.description}
            </p>
          )}
          <div className="flex gap-4 pt-2 text-xs font-semibold text-muted-foreground">
            <span>
              Столбцов:{" "}
              <strong className="text-primary-foreground">{formValues.columns.length}</strong>
            </span>
            <span>
              Участников:{" "}
              <strong className="text-primary-foreground">{formValues.participants.length}</strong>
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <WizardNavigation
          onPrev={onPrev}
          prevLabel="Назад: Участники"
          onNext={onSubmit}
          nextLabel="Опубликовать"
          isLoading={isSubmitting}
          loadingLabel="Публикация..."
        />
      </CardFooter>
    </>
  );
}

export { Step4Review };

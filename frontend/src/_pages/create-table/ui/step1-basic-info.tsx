import type { FieldErrors, UseFormRegister } from "react-hook-form";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Textarea,
} from "@/shared/ui";
import type { CreateTableFormValues } from "../model/create-table";
import { WizardNavigation } from "./wizard-navigation";

interface Props {
  register: UseFormRegister<CreateTableFormValues>;
  errors: FieldErrors<CreateTableFormValues>;
  onNext: () => void;
}

function Step1BasicInfo({ register, errors, onNext }: Props) {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold">Основная информация</CardTitle>
        <p className="text-md text-muted-foreground mt-1">
          Укажи название турнира и добавь описание
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <Field>
          <FieldContent>
            <FieldLabel htmlFor="table-name">
              Название таблицы / турнира <span className="text-destructive font-bold">*</span>
            </FieldLabel>
            <FieldDescription>Отображается в заголовке таблицы</FieldDescription>
          </FieldContent>
          <Input
            id="table-name"
            {...register("title")}
            placeholder="Например: Городской кубок по баскетболу"
            className="w-full h-11 px-4 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
          />
          {errors.title && <FieldError>{errors.title.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="table-description">
            Описание турнира
            <span className="text-muted-foreground">(Не обязательно)</span>
          </FieldLabel>
          <Textarea
            id="table-description"
            {...register("description")}
            rows={4}
            placeholder="Опишите краткий регламент, тайминги и правила начисления очков..."
            className="w-full p-4 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground resize-none"
          />
        </Field>
      </CardContent>

      <CardFooter>
        <WizardNavigation onNext={onNext} nextLabel="Далее: Настройка столбцов" />
      </CardFooter>
    </>
  );
}

export { Step1BasicInfo };

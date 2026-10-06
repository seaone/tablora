"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { createTable } from "@/shared/api";
import { type CreateTableFormValues, createTableSchema, type WizardStep } from "./create-table";

export const useCreateTableWizard = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    watch,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTableFormValues>({
    resolver: zodResolver(createTableSchema),
    defaultValues: {
      title: "",
      description: "",
      columns: [],
      participants: [],
    },
    mode: "onChange",
  });

  const {
    fields: columnFields,
    append: appendColumn,
    remove: removeColumn,
    update: updateColumn,
  } = useFieldArray({
    control,
    name: "columns",
  });

  const {
    fields: participantFields,
    append: appendParticipant,
    remove: removeParticipant,
    update: updateParticipant,
  } = useFieldArray({
    control,
    name: "participants",
  });

  const formValues = watch();

  const handleNextStep = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await trigger("title");
    } else if (currentStep === 2) {
      isValid = await trigger("columns");
    } else if (currentStep === 3) {
      isValid = await trigger("participants");
    }

    if (isValid && currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const created = await createTable(data);

      router.push(`/t/${created.id}/share`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка создания таблицы";
      setServerError(msg);
      setIsSubmitting(false);
    }
  });

  return {
    currentStep,
    setCurrentStep,
    handleNextStep,
    handlePrevStep,
    formValues,
    errors,
    register,
    control,
    columnFields,
    appendColumn,
    updateColumn,
    removeColumn,
    participantFields,
    appendParticipant,
    updateParticipant,
    removeParticipant,
    isSubmitting,
    serverError,
    onSubmit,
  };
};

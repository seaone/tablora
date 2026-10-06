"use client";

import { Card } from "@/shared/ui";
import { useCreateTableWizard } from "../model/use-create-table-wizard";
import { CreateTablePreview } from "./create-table-preview";
import { Step1BasicInfo } from "./step1-basic-info";
import { Step2Columns } from "./step2-columns";
import { Step3Participants } from "./step3-participants";
import { Step4Review } from "./step4-review";
import { WizardStepper } from "./wizard-stepper";

function CreateTableWizard() {
  const {
    currentStep,
    setCurrentStep,
    handleNextStep,
    handlePrevStep,
    formValues,
    errors,
    register,
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
  } = useCreateTableWizard();

  return (
    <div className="w-full">
      {/* 4-Step Stepper Bar */}
      <WizardStepper
        currentStep={currentStep}
        formValues={formValues}
        onSelectStep={setCurrentStep}
      />

      {serverError && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 flex items-center gap-2">
          <span>{serverError}</span>
        </div>
      )}

      {/* 2-Column Split: Form (7 cols) + Sticky Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Steps */}
        <Card className="lg:col-span-7">
          {currentStep === 1 && (
            <Step1BasicInfo register={register} errors={errors} onNext={handleNextStep} />
          )}

          {currentStep === 2 && (
            <Step2Columns
              columnFields={columnFields}
              errors={errors}
              onAddColumn={appendColumn}
              onUpdateColumn={updateColumn}
              onRemoveColumn={removeColumn}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
            />
          )}

          {currentStep === 3 && (
            <Step3Participants
              participantFields={participantFields}
              errors={errors}
              onAddParticipant={appendParticipant}
              onUpdateParticipant={updateParticipant}
              onRemoveParticipant={removeParticipant}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
            />
          )}

          {currentStep === 4 && (
            <Step4Review
              formValues={formValues}
              isSubmitting={isSubmitting}
              onPrev={handlePrevStep}
              onSubmit={onSubmit}
            />
          )}
        </Card>

        {/* Right Column: Sticky Live Preview (5 cols) */}
        <div className="lg:col-span-5">
          <CreateTablePreview formValues={formValues} />
        </div>
      </div>
    </div>
  );
}

export { CreateTableWizard };

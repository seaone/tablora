import type { FieldArrayWithId, FieldErrors } from "react-hook-form";
import type { ParticipantDraft } from "@/entities/table";
import { AddParticipant } from "@/features/add-participant";
import { DeleteParticipant } from "@/features/delete-participant";
import { EditParticipant } from "@/features/edit-participant";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  FieldError,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/shared/ui";
import type { CreateTableFormValues } from "../model/create-table";
import { WizardNavigation } from "./wizard-navigation";

interface Props {
  participantFields: FieldArrayWithId<CreateTableFormValues, "participants", "id">[];
  errors: FieldErrors<CreateTableFormValues>;
  onAddParticipant: (value: ParticipantDraft) => void;
  onUpdateParticipant: (index: number, value: ParticipantDraft) => void;
  onRemoveParticipant: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

function Step3Participants({
  participantFields,
  errors,
  onAddParticipant,
  onUpdateParticipant,
  onRemoveParticipant,
  onNext,
  onPrev,
}: Props) {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold">Участники и команды</CardTitle>
        <p className="text-md text-muted-foreground mt-1">Добавь команды или участников</p>
      </CardHeader>

      <CardContent className="space-y-3">
        {participantFields.length > 0 && (
          <ItemGroup>
            {participantFields.map((field, index) => (
              <Item key={field.id} variant="outline" size="sm">
                <ItemMedia>
                  <span className="w-4 h-4 rounded-full bg-muted text-muted-foreground font-bold text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{field.name}</ItemTitle>
                  {field.description && <ItemDescription>{field.description}</ItemDescription>}
                </ItemContent>
                <ItemActions>
                  <EditParticipant
                    participant={field}
                    onSubmit={(value) => onUpdateParticipant(index, value)}
                  />
                  <DeleteParticipant
                    name={field.name}
                    onConfirm={() => onRemoveParticipant(index)}
                  />
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        )}

        {errors.participants?.root?.message && (
          <FieldError>{errors.participants.root.message}</FieldError>
        )}

        <AddParticipant onSubmit={onAddParticipant} className="w-full" />
      </CardContent>

      <CardFooter>
        <WizardNavigation
          onPrev={onPrev}
          prevLabel="Назад: Столбцы"
          onNext={onNext}
          nextLabel="Далее: Подтверждение"
        />
      </CardFooter>
    </>
  );
}

export { Step3Participants };

import * as z from "zod";

export const participantSchema = z.object({
  name: z.string().min(1, "Имя участника не может быть пустым"),
  description: z.string().optional(),
});

export type ParticipantDraft = z.infer<typeof participantSchema>;

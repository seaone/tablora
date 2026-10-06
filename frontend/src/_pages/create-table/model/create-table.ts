import * as z from "zod";
import { columnSchema, participantSchema } from "@/entities/table";

export const createTableSchema = z.object({
  title: z.string().trim().min(1, "Название таблицы не может быть пустым"),
  description: z.string().trim().optional(),
  columns: z.array(columnSchema).min(1, "Добавьте хотя бы один столбец"),
  participants: z.array(participantSchema).min(1, "Добавьте хотя бы одного участника"),
});

export type CreateTableFormValues = z.infer<typeof createTableSchema>;
export type WizardStep = 1 | 2 | 3 | 4;

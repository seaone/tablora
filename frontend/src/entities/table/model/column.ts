import * as z from "zod";
import { COLUMN_TYPES } from "@tablora/shared";

export const columnSchema = z.object({
  name: z.string().min(1, "Название столбца не может быть пустым"),
  type: z.enum(COLUMN_TYPES),
});

export type ColumnDraft = z.infer<typeof columnSchema>;

import type { ColumnType } from "@/shared/api";

// Convert a time such as "mm:ss.ms" or "hh:mm:ss" to seconds for sorting.
// Missing, unparseable, or negative values return Infinity and are ranked last.
export const parseTimeToMs = (timeStr: string): number => {
  if (!timeStr.trim()) return Infinity;

  const parts = timeStr.trim().split(":");
  const values = parts.map(Number);
  if (values.some((value) => !Number.isFinite(value) || value < 0)) return Infinity;

  if (values.length === 1) return values[0];
  if (values.length === 2) return values[0] * 60 + values[1];
  if (values.length === 3) return values[0] * 3600 + values[1] * 60 + values[2];

  return Infinity;
};

/** Compares two score strings; missing or invalid values always go last. */
export function compareScoreValues(
  type: ColumnType,
  direction: "asc" | "desc",
  a: string,
  b: string,
): number {
  if (type === "time") {
    const timeA = parseTimeToMs(a);
    const timeB = parseTimeToMs(b);
    if (!Number.isFinite(timeA) && !Number.isFinite(timeB)) return 0;
    if (!Number.isFinite(timeA)) return 1;
    if (!Number.isFinite(timeB)) return -1;
    return direction === "asc" ? timeA - timeB : timeB - timeA;
  }

  if (type === "number") {
    const valA = a.trim() === "" ? Number.NaN : Number(a);
    const valB = b.trim() === "" ? Number.NaN : Number(b);
    if (!Number.isFinite(valA) && !Number.isFinite(valB)) return 0;
    if (!Number.isFinite(valA)) return 1;
    if (!Number.isFinite(valB)) return -1;
    return direction === "asc" ? valA - valB : valB - valA;
  }

  return direction === "asc" ? a.localeCompare(b) : b.localeCompare(a);
}

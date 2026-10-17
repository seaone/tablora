import { LoaderIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/shared/lib";

/**
 * Presentational spinner. Accessibility semantics belong to the consumer
 * (a loader's live region or a disabled loading button).
 */
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      data-slot="spinner"
      aria-hidden="true"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };

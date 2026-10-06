import type * as React from "react";
import { cn } from "@/shared/lib";

/** Page content container: the shared page canvas (width, padding, dotted background). */
function Main({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8", className)}
      {...props}
    />
  );
}

export { Main };

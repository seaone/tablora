import type * as React from "react";
import { cn } from "@/shared/lib";

/** Full-page shell: enforces viewport height and a vertical flex layout. */
function Page({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/10 selection:text-primary",
        "bg-[radial-gradient(#d3e4fe_1px,transparent_1px)] bg-size-[24px_24px]",
        className,
      )}
      {...props}
    />
  );
}

export { Page };

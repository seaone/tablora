import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/shared/lib";
import { Spinner } from "./spinner";

const spinnerSizes = {
  sm: "size-4",
  default: "size-8",
  lg: "size-12",
} as const;

const loaderLabelVariants = cva("font-medium text-muted-foreground", {
  variants: {
    size: {
      sm: "text-xs",
      default: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface LoaderProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof loaderLabelVariants> {
  /** Message rendered below the spinner. Omit for a bare spinner. */
  label?: string;
}

/** Loading state: a centered spinner with an optional label. */
function Loader({ className, label, size = "default", ...props }: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-slot="loader"
      className={cn("bg-background flex min-h-32 items-center justify-center p-4", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-3">
        <Spinner className={spinnerSizes[size ?? "default"]} />
        {label ? (
          <span className={cn(loaderLabelVariants({ size }))}>{label}</span>
        ) : (
          <span className="sr-only">Загрузка</span>
        )}
      </div>
    </div>
  );
}

export { Loader };

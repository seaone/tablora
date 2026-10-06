import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/shared/lib";

const loaderVariants = cva("rounded-full border-primary border-t-transparent animate-spin", {
  variants: {
    size: {
      sm: "size-4 border-2",
      default: "size-10 border-4",
      lg: "size-14 border-4",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

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

interface LoaderProps extends React.ComponentProps<"div">, VariantProps<typeof loaderVariants> {
  /** Message rendered below the spinner. Omit for a bare spinner. */
  label?: string;
}

/** Full-page loading state: a centered spinner with an optional label. */
function Loader({ className, label, size = "default", ...props }: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-slot="loader"
      className={cn("min-h-screen bg-background flex items-center justify-center p-4", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-3">
        <div aria-hidden="true" className={cn(loaderVariants({ size }))} />
        {label ? (
          <span className={cn(loaderLabelVariants({ size }))}>{label}</span>
        ) : (
          <span className="sr-only">Загрузка</span>
        )}
      </div>
    </div>
  );
}

export { Loader, loaderVariants };

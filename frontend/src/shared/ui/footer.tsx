import type React from "react";
import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib";

interface FooterProps {
  tagline?: string;
  rightContent?: React.ReactNode;
  containerClassName?: HTMLAttributes<HTMLElement>["className"];
}

function Footer({
  tagline,
  rightContent,
  className,
  containerClassName,
  children,
  ...props
}: FooterProps & React.HTMLAttributes<HTMLElement>) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn("w-full bg-card border-t border-border py-4 px-4 sm:px-6 mt-auto", className)}
      {...props}
    >
      <div
        className={cn(
          "max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground gap-2",
          containerClassName,
        )}
      >
        <div className="flex items-center gap-2">
          <span>
            © {currentYear} Таблора{tagline ? `. ${tagline}` : ""}
          </span>
        </div>

        {rightContent ? (
          <div className="flex items-center gap-6">{rightContent}</div>
        ) : children ? (
          <div className="flex items-center gap-6">{children}</div>
        ) : null}
      </div>
    </footer>
  );
}

export { Footer };

import Link from "next/link";
import type React from "react";
import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib";

interface HeaderProps {
  containerClassName?: HTMLAttributes<HTMLElement>["className"];
  logoHref?: string;
  logoAlt?: string;
  leftContent?: React.ReactNode;
  subtitle?: React.ReactNode;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

function Header({
  className,
  containerClassName,
  logoHref = "/",
  logoAlt = "Таблора",
  leftContent,
  subtitle,
  centerContent,
  rightContent,
  children,
  ...props
}: HeaderProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn("bg-card border-b border-border sticky top-0 z-40 shadow-xs", className)}
      {...props}
    >
      <div
        className={cn(
          "w-full px-4 sm:px-6 mx-auto flex items-center justify-between h-16 gap-3",
          containerClassName || "max-w-7xl",
        )}
      >
        {/* Left Section: Logo & Subtitle */}
        <div className="flex items-center gap-3 min-w-0">
          {leftContent ? (
            leftContent
          ) : (
            <Link
              href={logoHref}
              className="group flex gap-x-2 items-center shrink-0 transition-transform focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary active:not-aria-[haspopup]:translate-y-px rounded-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
                <rect
                  className="fill-primary group-hover:fill-primary/80"
                  width="36"
                  height="36"
                  rx="8"
                  ry="8"
                />
                <path
                  className="fill-primary-foreground"
                  d="M6,12v10c0,1.1.9,2,2,2h6v4c0,1.1.9,2,2,2h4c1.1,0,2-.9,2-2v-6h6c1.1,0,2-.9,2-2v-8H6Z"
                />
                <path
                  className="fill-secondary"
                  d="M28,6H8c-1.1,0-2,.9-2,2v6c0,1.1.9,2,2,2h6v4c0,1.1.9,2,2,2h4c1.1,0,2-.9,2-2v-6h6c1.1,0,2-.9,2-2v-4c0-1.1-.9-2-2-2Z"
                />
              </svg>
              <span className="font-heading font-bold text-xl group-hover:text-primary-foreground transition-all">
                Таблора
              </span>
            </Link>
          )}

          {subtitle ? (
            <>
              <div className="h-5 w-px bg-border shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex items-center">{subtitle}</div>
            </>
          ) : null}
        </div>

        {/* Center Section */}
        {centerContent ? (
          <div className="flex items-center justify-center">{centerContent}</div>
        ) : null}

        {/* Right Section */}
        {rightContent || children ? (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {rightContent}
            {children}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export { Header };

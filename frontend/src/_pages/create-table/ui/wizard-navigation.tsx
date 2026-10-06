import { ArrowLeft, ArrowRight } from "lucide-react";
import type React from "react";
import { cn, useMediaQuery } from "@/shared/lib";
import { Button } from "@/shared/ui";

interface Props {
  onPrev?: () => void;
  prevLabel?: string;
  onNext?: () => void;
  nextLabel: string;
  nextIcon?: React.ReactNode;
  nextIconPosition?: "start" | "end";
  disabled?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  className?: string;
}

function WizardNavigation({
  onPrev,
  prevLabel = "Назад",
  onNext,
  nextLabel,
  nextIcon = <ArrowRight className="w-4 h-4" />,
  nextIconPosition = "end",
  disabled = false,
  isLoading = false,
  loadingLabel = "Загрузка...",
  className,
}: Props) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <div
      className={cn(
        "flex items-center w-full",
        onPrev ? "justify-between" : "justify-end",
        className,
      )}
    >
      {onPrev && (
        <Button
          type="button"
          variant="outline"
          size={isMobile ? "icon-lg" : "lg"}
          onClick={onPrev}
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4" />
          {!isMobile && <span>{prevLabel}</span>}
        </Button>
      )}

      {onNext && (
        <Button
          type="button"
          variant="default"
          size="lg"
          onClick={onNext}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <>
              <span>{loadingLabel}</span>
            </>
          ) : (
            <>
              {nextIconPosition === "start" && nextIcon}
              <span>{nextLabel}</span>
              {nextIconPosition === "end" && nextIcon}
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export type { Props };
export { WizardNavigation };

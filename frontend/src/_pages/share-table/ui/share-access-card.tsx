import React from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Input,
  QRCode,
  buttonVariants,
} from "@/shared/ui";
import { Copy, Check } from "lucide-react";
import { cn } from "cn";

interface Props {
  badgeText: string;
  badgeVariant?: React.ComponentProps<typeof Badge>["variant"];
  url: string;
  qrSize?: number;
  linkLabel: string;
  copied: boolean;
  onCopy: () => void;
  actionHref: string;
  actionText: string;
  actionIcon: React.ReactNode;
  actionVariant?: React.ComponentProps<typeof Button>["variant"];
  className?: string;
}

function ShareAccessCard({
  badgeText,
  badgeVariant,
  url,
  qrSize = 160,
  linkLabel,
  copied,
  onCopy,
  actionHref,
  actionText,
  actionIcon,
  actionVariant = "default",
  className,
}: Props) {
  const inputId = React.useId();

  return (
    <Card className={cn("bg-accent", className)}>
      <CardHeader>
        <Badge variant={badgeVariant}>{badgeText}</Badge>
      </CardHeader>

      <CardContent className="items-center">
        <QRCode value={url} size={qrSize} />

        <div className="space-y-2 w-full">
          <div>
            <label htmlFor={inputId} className="text-xs font-semibold text-muted-foreground">
              {linkLabel}
            </label>
          </div>

          <div className="w-full flex items-center gap-1">
            <Input id={inputId} type="text" readOnly value={url} className="w-full" />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onCopy}
              title="Скопировать"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="mt-auto border-t">
        <Link
          href={actionHref}
          className={buttonVariants({
            variant: actionVariant,
            size: "default",
            className: "w-full",
          })}
        >
          {actionIcon}
          <span>{actionText}</span>
        </Link>
      </CardFooter>
    </Card>
  );
}

export { ShareAccessCard };

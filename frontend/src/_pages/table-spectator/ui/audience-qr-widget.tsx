"use client";

import { useId, useState, type HTMLAttributes } from "react";
import { cn } from "@/shared/lib";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  QRCode,
} from "@/shared/ui";
import { Check, Copy } from "lucide-react";

interface Props {
  className?: HTMLAttributes<HTMLElement>["className"];
  spectatorUrl: string;
}

function AudienceQrWidget({ className, spectatorUrl }: Props) {
  const inputId = useId();
  const [copiedSpectator, setCopiedSpectator] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSpectator(true);
    setTimeout(() => setCopiedSpectator(false), 2000);
  };

  return (
    <aside className={cn(className)}>
      <Card>
        <CardHeader className="items-center text-center">
          <CardTitle className="text-lg font-bold text-foreground">
            Следи за игрой со смартфона
          </CardTitle>
          <CardDescription className="font-semibold text-muted-foreground">
            Отсканируй QR-код, чтобы следить за результатами турнира в реальном времени.
          </CardDescription>
        </CardHeader>

        <CardContent className="items-center">
          {/* Dynamic QR Code widget matching Stitch */}
          <QRCode value={spectatorUrl} size={180} />
          <div className="w-full flex items-center gap-1">
            <Input id={inputId} type="text" readOnly value={spectatorUrl} className="w-full" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(spectatorUrl)}
              title="Скопировать"
            >
              {copiedSpectator ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}

export { AudienceQrWidget };

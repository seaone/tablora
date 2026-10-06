"use client";

import React from "react";
import type { HTMLAttributes } from "react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/shared/lib";

interface QRCodeProps {
  value: string;
  size?: number;
  className?: HTMLAttributes<HTMLElement>["className"];
  bgColor?: string;
  fgColor?: string;
  includeMargin?: boolean;
}

function QRCode({
  value,
  size = 180,
  className,
  bgColor = "#ffffff",
  fgColor = "#0f172a",
}: QRCodeProps) {
  if (!value) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center p-3 rounded-lg bg-white border border-border shadow-sm",
        className,
      )}
    >
      <QRCodeSVG value={value} size={size} bgColor={bgColor} fgColor={fgColor} level="M" />
    </div>
  );
}

export { QRCode };

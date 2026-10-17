"use client";

import * as React from "react";
import { AuthProvider } from "@/entities/user";
import { TooltipProvider } from "@/shared/ui";

interface ProvidersProps {
  children: React.ReactNode;
}

function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </AuthProvider>
  );
}

export { Providers };

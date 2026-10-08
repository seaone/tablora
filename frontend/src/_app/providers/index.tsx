"use client";

import * as React from "react";
import { AuthProvider } from "@/entities/user";

interface ProvidersProps {
  children: React.ReactNode;
}

function Providers({ children }: ProvidersProps) {
  return <AuthProvider>{children}</AuthProvider>;
}

export { Providers };

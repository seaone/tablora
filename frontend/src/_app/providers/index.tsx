"use client";

import * as React from "react";

interface ProvidersProps {
  children: React.ReactNode;
}

function Providers({ children }: ProvidersProps) {
  return <>{children}</>;
}

export { Providers };

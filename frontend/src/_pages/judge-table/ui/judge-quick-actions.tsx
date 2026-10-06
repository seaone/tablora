import type React from "react";

interface Props {
  children: React.ReactNode;
}

function JudgeQuickActions({ children }: Props) {
  return <div className="grid grid-cols-2 gap-2.5">{children}</div>;
}

export { JudgeQuickActions };

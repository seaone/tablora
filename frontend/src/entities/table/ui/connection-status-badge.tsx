import { Radio, RadioOff } from "lucide-react";
import type React from "react";
import { Badge } from "@/shared/ui";
import type { ConnectionStatus } from "../model/use-live-table";

interface ConnectionStatusBadgeProps {
  status: ConnectionStatus;
}

export const ConnectionStatusBadge: React.FC<ConnectionStatusBadgeProps> = ({ status }) => {
  if (status === "connected") {
    return (
      <Badge variant="secondary">
        <Radio aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">Онлайн</span>
      </Badge>
    );
  }

  return (
    <Badge variant="destructive">
      <RadioOff aria-hidden="true" />
      <span className="sr-only sm:not-sr-only">
        {status === "connecting" ? "Подключение..." : "Переподключение..."}
      </span>
    </Badge>
  );
};

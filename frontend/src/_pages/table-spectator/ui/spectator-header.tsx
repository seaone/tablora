import { Edit3, Maximize2, Minimize2 } from "lucide-react";
import Link from "next/link";
import { type ConnectionStatus, ConnectionStatusBadge } from "@/entities/table";
import { AccountControl } from "@/features/account";
import { ACTION_LABELS } from "@/shared/config";
import { ActionTooltip, Button, Header, buttonVariants } from "@/shared/ui";

interface Props {
  tableId: string;
  status: ConnectionStatus;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

function SpectatorHeader({ tableId, status, isFullscreen, onToggleFullscreen }: Props) {
  return (
    <Header
      className="z-50"
      containerClassName="max-w-7xl"
      subtitle={<ConnectionStatusBadge status={status} />}
      rightContent={
        <div className="flex items-center gap-2">
          <ActionTooltip
            label={isFullscreen ? ACTION_LABELS.exitFullscreen : ACTION_LABELS.enterFullscreen}
            trigger={
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-pressed={isFullscreen}
                onClick={onToggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Maximize2 className="w-4 h-4" aria-hidden="true" />
                )}
              </Button>
            }
          />
          <ActionTooltip
            label={ACTION_LABELS.editTable}
            trigger={
              <Link
                href={`/t/${tableId}/edit`}
                className={buttonVariants({ variant: "outline", size: "icon" })}
              >
                <Edit3 className="w-4 h-4" aria-hidden="true" />
              </Link>
            }
          />
          <AccountControl />
        </div>
      }
    />
  );
}

export { SpectatorHeader };

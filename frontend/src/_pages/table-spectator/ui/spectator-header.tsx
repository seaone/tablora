import { Edit3, Maximize2, Minimize2 } from "lucide-react";
import Link from "next/link";
import { type ConnectionStatus, ConnectionStatusBadge } from "@/entities/table";
import { useMediaQuery } from "@/shared/lib";
import { Button, buttonVariants, Header } from "@/shared/ui";

interface Props {
  tableId: string;
  status: ConnectionStatus;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

function SpectatorHeader({ tableId, status, isFullscreen, onToggleFullscreen }: Props) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <Header
      className="z-50"
      containerClassName="max-w-7xl"
      subtitle={<ConnectionStatusBadge status={status} />}
      rightContent={
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onToggleFullscreen}
            size={isMobile ? "icon" : "default"}
            title="Полноэкранный режим табло"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Maximize2 className="w-4 h-4" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">{isFullscreen ? "Свернуть" : "На весь экран"}</span>
          </Button>

          <Link
            href={`/t/${tableId}/edit`}
            className={buttonVariants({ variant: "outline", size: isMobile ? "icon" : "default" })}
          >
            <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Судейство</span>
          </Link>
        </div>
      }
    />
  );
}

export { SpectatorHeader };

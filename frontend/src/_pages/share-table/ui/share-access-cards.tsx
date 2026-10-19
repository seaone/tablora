import { ExternalLink } from "lucide-react";
import { ShareAccessCard } from "./share-access-card";

interface Props {
  tableId: string;
  judgeUrl: string;
  spectatorUrl: string;
  copiedJudge: boolean;
  copiedSpectator: boolean;
  onCopy: (text: string, isJudge: boolean) => void;
}

function ShareAccessCards({
  tableId,
  judgeUrl,
  spectatorUrl,
  copiedJudge,
  copiedSpectator,
  onCopy,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* JUDGE CARD */}
      <ShareAccessCard
        badgeText="Для судей"
        url={judgeUrl}
        linkLabel="Прямой доступ для судей:"
        copied={copiedJudge}
        onCopy={() => onCopy(judgeUrl, true)}
        actionHref={`/t/${tableId}/edit`}
        actionText="Открыть таблицу судьи"
        actionIcon={<ExternalLink className="w-4 h-4" />}
        actionVariant="default"
      />

      {/* SPECTATOR CARD */}
      <ShareAccessCard
        badgeText="Для зрителей"
        badgeVariant="outline"
        url={spectatorUrl}
        linkLabel="Публичная ссылка:"
        copied={copiedSpectator}
        onCopy={() => onCopy(spectatorUrl, false)}
        actionHref={`/t/${tableId}`}
        actionText="Открыть таблицу"
        actionIcon={<ExternalLink className="w-4 h-4" />}
        actionVariant="outline"
      />
    </div>
  );
}

export { ShareAccessCards };

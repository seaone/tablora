import { Eye } from "lucide-react";
import Link from "next/link";
import { type ConnectionStatus, ConnectionStatusBadge } from "@/entities/table";
import { AccountControl } from "@/features/account";
import { DeleteTable } from "@/features/delete-table";
import { ACTION_LABELS } from "@/shared/config";
import { ActionTooltip, Header, buttonVariants } from "@/shared/ui";

interface Props {
  tableId: string;
  status: ConnectionStatus;
  /** Only the owner may delete the table (score-editing spec). */
  isOwner: boolean;
  onDeleteTable: () => void | Promise<void>;
}

function JudgeTableHeader({ tableId, status, isOwner, onDeleteTable }: Props) {
  return (
    <Header
      className="z-50"
      containerClassName="max-w-7xl"
      subtitle={<ConnectionStatusBadge status={status} />}
      rightContent={
        <>
          {isOwner && <DeleteTable onConfirm={onDeleteTable} size="icon" />}
          <ActionTooltip
            label={ACTION_LABELS.viewTable}
            trigger={
              <Link
                href={`/t/${tableId}`}
                className={buttonVariants({ variant: "outline", size: "icon" })}
              >
                <Eye className="w-4 h-4" aria-hidden="true" />
              </Link>
            }
          />
          <AccountControl />
        </>
      }
    />
  );
}

export { JudgeTableHeader };

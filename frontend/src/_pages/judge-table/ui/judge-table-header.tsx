import { Eye } from "lucide-react";
import Link from "next/link";
import { type ConnectionStatus, ConnectionStatusBadge } from "@/entities/table";
import { AccountControl } from "@/features/account";
import { DeleteTable } from "@/features/delete-table";
import { useMediaQuery } from "@/shared/lib";
import { buttonVariants, Header } from "@/shared/ui";
import { useJudgeTable } from "../model/use-judge-table";

interface Props {
  tableId: string;
  tableTitle: string;
  status: ConnectionStatus;
}

function JudgeTableHeader({ tableId, status }: Props) {
  const { handleDeleteTable } = useJudgeTable(tableId);
  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <Header
      className="z-50"
      containerClassName="max-w-7xl"
      subtitle={<ConnectionStatusBadge status={status} />}
      rightContent={
        <>
          <DeleteTable
            onConfirm={handleDeleteTable}
            size={isMobile ? "icon" : "default"}
            withLabel
          />
          <Link
            href={`/t/${tableId}`}
            className={buttonVariants({
              variant: "outline",
              size: isMobile ? "icon" : "default",
            })}
          >
            <Eye className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="hidden sm:inline">Табло</span>
          </Link>
          <AccountControl />
        </>
      }
    />
  );
}

export { JudgeTableHeader };

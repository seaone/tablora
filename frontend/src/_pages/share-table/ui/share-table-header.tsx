import { AccountControl } from "@/features/account";
import { Header } from "@/shared/ui";

function ShareTableHeader() {
  return (
    <Header
      subtitle={
        <span className="text-xs sm:text-sm font-medium text-foreground">Публикация таблицы</span>
      }
      rightContent={<AccountControl />}
    />
  );
}

export { ShareTableHeader };

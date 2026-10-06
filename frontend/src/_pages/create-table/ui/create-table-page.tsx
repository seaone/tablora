import Link from "next/link";
import { Footer, Main, Page } from "@/shared/ui";
import { CreateTableHeader } from "./create-table-header";
import { CreateTableWizard } from "./create-table-wizard";

function CreateTablePage() {
  return (
    <Page>
      {/* TOP HEADER / WIZARD APP BAR matching Stitch */}
      <CreateTableHeader />

      {/* MAIN CANVAS */}
      <Main className="flex-1">
        <CreateTableWizard />
      </Main>

      {/* MINIMAL FOOTER matching Stitch */}
      <Footer>
        <Link
          href="/"
          className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          На главную
        </Link>
      </Footer>
    </Page>
  );
}

export { CreateTablePage };

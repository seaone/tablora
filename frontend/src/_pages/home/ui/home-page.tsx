"use client";

import Link from "next/link";
import { Footer, Main, Page } from "@/shared/ui";
import { HomeHeader } from "./home-header";
import { HomeHero } from "./home-hero";
import { HomeWorkflowCard } from "./home-workflow-card";

function HomePage() {
  return (
    <Page>
      {/* Top App Bar */}
      <HomeHeader />

      {/* Hero Section */}
      <Main>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Column */}
          <HomeHero />

          {/* Right Hero Column: Interactive Card */}
          <HomeWorkflowCard />
        </div>
      </Main>

      {/* Footer */}
      <Footer>
        <Link
          href="/new"
          className="hover:text-primary transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          Создать таблицу
        </Link>
      </Footer>
    </Page>
  );
}

export { HomePage };

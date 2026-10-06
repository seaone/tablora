import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Montserrat } from "next/font/google";
import { Providers } from "@/_app/providers";
import "@/_app/styles/globals.css";
import { cn } from "@/shared/lib";

const montserratHeading = Montserrat({ subsets: ["latin"], variable: "--font-heading" });

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Таблора",
  description: "Результаты соревнований в реальном времени",
  appleWebApp: {
    title: "Таблора",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={cn(inter.variable, jetbrainsMono.variable, montserratHeading.variable)}
    >
      <body className="font-sans antialiased bg-background text-foreground min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

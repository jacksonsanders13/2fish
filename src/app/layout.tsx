import type { Metadata, Viewport } from "next";
import { Nunito_Sans } from "next/font/google";
import BoardProvider from "@/components/BoardProvider";
import TopBar from "@/components/TopBar";
import HelpDialog from "@/components/HelpDialog";
import Toast from "@/components/Toast";
import { Notice } from "@/components/ui/notice";
import { supabaseConfigured } from "@/lib/supabase";
import "./globals.css";

const nunito = Nunito_Sans({ subsets: ["latin"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "2fish · A little is enough",
  description: "Post what you need. Neighbors nearby help by dropping it off or buying from your wishlist.",
};

// Browser chrome color. Metadata can't read CSS variables, so these are the
// hex versions of --primary (light) and --primary (dark) from globals.css.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1a5bcb" },
    { media: "(prefers-color-scheme: dark)", color: "#5f97f2" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only rounded-md bg-surface px-4 py-2 font-extrabold text-foreground shadow-pop focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
        >
          Skip to content
        </a>
        <BoardProvider>
          <TopBar />
          <main id="main" className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-24 pt-4 md:px-6 md:pt-6">
            {!supabaseConfigured && (
              <Notice variant="warning">
                Preview mode: example posts only. Changes stay on this screen and go away when you refresh.
              </Notice>
            )}
            {children}
          </main>
          <HelpDialog />
          <Toast />
        </BoardProvider>
      </body>
    </html>
  );
}

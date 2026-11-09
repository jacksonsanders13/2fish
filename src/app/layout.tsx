import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import BoardProvider from "@/components/BoardProvider";
import TopBar from "@/components/TopBar";
import { BottomNav } from "@/components/Nav";
import { LeftRail, RightRail } from "@/components/Rails";
import { themeScript } from "@/components/ThemeToggle";
import HelpDialog from "@/components/HelpDialog";
import Toast from "@/components/Toast";
import { Notice } from "@/components/ui/notice";
import { supabaseConfigured } from "@/lib/supabase";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const body = Figtree({ subsets: ["latin"], variable: "--font-figtree" });

export const metadata: Metadata = {
  title: "2fish · A little is enough",
  description: "Post what you need. Neighbors nearby help by dropping it off or buying from your wishlist.",
};

// Browser chrome color: the page background (metadata can't read CSS vars).
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#110f0e" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // the theme script may set data-theme before React loads
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only rounded-md bg-surface px-4 py-2 font-bold text-foreground shadow-pop focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
        >
          Skip to content
        </a>
        <BoardProvider>
          {/* phone: one column. desktop: left rail | feed | right rail */}
          <div className="mx-auto flex max-w-[1200px] justify-center">
            <LeftRail />
            <div className="min-h-dvh w-full min-w-0 max-w-[620px] border-border lg:border-x">
              <TopBar />
              {!supabaseConfigured && (
                <Notice variant="banner">Preview mode: example posts only. Refreshing resets them.</Notice>
              )}
              <main id="main" className="pb-28 lg:pb-12">
                {children}
              </main>
            </div>
            <RightRail />
          </div>
          <BottomNav />
          <HelpDialog />
          <Toast />
        </BoardProvider>
      </body>
    </html>
  );
}

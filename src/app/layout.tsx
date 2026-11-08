import type { Metadata, Viewport } from "next";
import { Nunito_Sans } from "next/font/google";
import BoardProvider from "@/components/BoardProvider";
import TopBar from "@/components/TopBar";
import HelpDialog from "@/components/HelpDialog";
import Toast from "@/components/Toast";
import "./globals.css";

const nunito = Nunito_Sans({ subsets: ["latin"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "2fish · A little is enough",
  description: "Post what you need. Neighbors nearby help by dropping it off or buying from your wishlist.",
};

export const viewport: Viewport = {
  themeColor: "#1b5fd1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="font-sans antialiased">
        <BoardProvider>
          <TopBar />
          <main className="mx-auto grid max-w-[680px] gap-3 px-4 pb-[72px] pt-3">
            <div className="rounded-xl border border-warn bg-warn-soft px-3 py-2.5 text-sm">
              Preview mode: example posts only. Changes stay on this screen and go away when you refresh.
            </div>
            {children}
          </main>
          <HelpDialog />
          <Toast />
        </BoardProvider>
      </body>
    </html>
  );
}

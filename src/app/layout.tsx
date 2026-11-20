import type { Metadata, Viewport } from "next";
import { Calistoga, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

// Calistoga for headlines, IBM Plex Sans for everything else.
const calistoga = Calistoga({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-calistoga",
  display: "swap",
});

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "2fish", template: "%s · 2fish" },
  description: "Find the money your business is losing. Then get it back.",
  // Not launched yet. Keep it out of search results.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0e3b3c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${calistoga.variable} ${plex.variable}`}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">{children}</body>
    </html>
  );
}

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="glow-amber pointer-events-none absolute inset-x-0 top-0 h-80" />
      <header className="relative flex h-14 items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="2fish home" className="rounded-md">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>
      <main className="relative flex flex-1 items-start justify-center px-4 pt-8 pb-16 sm:pt-14">
        <div className="w-full max-w-sm">{children}</div>
      </main>
      <footer className="relative flex justify-center gap-4 pb-6 text-xs text-muted-foreground">
        <Link href="/privacy" className="hover:text-foreground">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-foreground">
          Terms
        </Link>
        <Link href="/safety" className="hover:text-foreground">
          Safety
        </Link>
      </footer>
    </div>
  );
}

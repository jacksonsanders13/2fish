import Link from "next/link";
import { LayoutDashboard, LogOut, MessageSquareText, Settings, Users, Video } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { signOut } from "@/lib/plan/actions";
import { cn } from "@/lib/utils";

export type Section = "dashboard" | "text-back" | "customers" | "videos" | "settings";

const nav: { key: Section; label: string; icon: typeof LayoutDashboard; href: string; soon?: boolean }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { key: "text-back", label: "Text-back", icon: MessageSquareText, href: "/dashboard/text-back" },
  { key: "customers", label: "Customers", icon: Users, href: "/dashboard/customers" },
  { key: "videos", label: "Videos", icon: Video, href: "/dashboard/videos", soon: true },
  { key: "settings", label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

/** Standard page padding inside the shell. */
export function PageBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <Container className={cn("py-6 sm:py-8 lg:py-10", className)}>{children}</Container>;
}

// Night top bar, bottom tabs on phones.
export function AppShell({ active, email, children }: { active: Section; email?: string; children: React.ReactNode }) {
  const initials = (email ?? "2f").slice(0, 2).toUpperCase();
  return (
    <div className="min-h-dvh bg-surface pb-20 md:pb-0">
      <header className="on-night bg-night text-white">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link href="/dashboard" className="rounded-md">
            <Logo />
          </Link>
          <nav aria-label="App" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={item.key === active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm",
                      item.key === active ? "bg-white/12 font-semibold" : "text-white/80 hover:text-white",
                    )}
                  >
                    <item.icon size={15} aria-hidden="true" />
                    {item.label}
                    {item.soon ? <span className="rounded-full border border-on-night-line px-1.5 text-[11px] leading-4 text-on-night-muted">preview</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <form action={signOut} className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-night" title={email}>
              {initials}
            </span>
            <button type="submit" className="flex items-center gap-1.5 rounded-md text-sm text-white/80 hover:text-white">
              <LogOut size={16} aria-hidden="true" />
              <span className="sr-only md:not-sr-only">Sign out</span>
            </button>
          </form>
        </Container>
      </header>
      <main className="overflow-x-clip">{children}</main>
      <nav aria-label="App" className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white md:hidden">
        <ul className="grid grid-cols-4">
          {nav
            .filter((n) => n.key !== "videos")
            .map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={item.key === active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-sm",
                    item.key === active ? "font-semibold text-night" : "text-muted-foreground",
                  )}
                >
                  <item.icon size={20} aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </div>
  );
}

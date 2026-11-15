import Link from "next/link";
import { Bell, LayoutDashboard, MessageSquareText, Star, Users, Video } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

export type Section = "dashboard" | "text-back" | "videos" | "reviews" | "customers";

const nav: { key: Section; label: string; icon: typeof LayoutDashboard; href: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { key: "text-back", label: "Text-back", icon: MessageSquareText, href: "/dashboard/text-back" },
  { key: "videos", label: "Videos", icon: Video, href: "/dashboard/videos" },
  // These two aren't built yet. They land on the dashboard for now.
  { key: "reviews", label: "Reviews", icon: Star, href: "/dashboard" },
  { key: "customers", label: "Customers", icon: Users, href: "/dashboard" },
];

/** Standard page padding inside the shell. */
export function PageBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <Container className={cn("py-6 sm:py-8 lg:py-10", className)}>{children}</Container>;
}

// Navy top bar, bottom tabs on phones. `initials` and `menu` come from the
// signed-in user; the mock screens pass sample values.
export function AppShell({
  active,
  initials = "2f",
  menu,
  children,
}: {
  active: Section;
  initials?: string;
  menu?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-surface pb-20 md:pb-0">
      <header className="on-navy bg-navy text-white">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="rounded-md">
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
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-3">
            <button type="button" className="flex items-center gap-1.5 rounded-md text-sm text-white/80">
              <Bell size={16} aria-hidden="true" />
              <span className="sr-only md:not-sr-only">Alerts</span>
            </button>
            {menu ?? (
              <span className="flex size-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-navy">
                {initials}
              </span>
            )}
          </div>
        </Container>
      </header>
      <main>{children}</main>
      <nav aria-label="App" className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white md:hidden">
        <ul className="grid grid-cols-4">
          {nav.slice(0, 4).map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={item.key === active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-sm",
                  item.key === active ? "font-semibold text-navy" : "text-muted-foreground",
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

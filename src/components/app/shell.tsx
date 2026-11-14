import Link from "next/link";
import { Bell, LayoutDashboard, MessageSquareText, Settings, Star, Users, Video } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { business } from "@/lib/data";
import { cn, type Dir } from "@/lib/utils";

export type Section = "dashboard" | "text-back" | "videos" | "reviews" | "customers";

const nav: { key: Section; label: string; icon: typeof LayoutDashboard; href: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "dashboard" },
  { key: "text-back", label: "Text-back", icon: MessageSquareText, href: "text-back" },
  { key: "videos", label: "Videos", icon: Video, href: "videos" },
  // These two aren't mocked yet. They land on the dashboard for now.
  { key: "reviews", label: "Reviews", icon: Star, href: "dashboard" },
  { key: "customers", label: "Customers", icon: Users, href: "dashboard" },
];

export function AppShell({ dir, active, children }: { dir: Dir; active: Section; children: React.ReactNode }) {
  return dir === "a" ? (
    <ShellA dir={dir} active={active}>
      {children}
    </ShellA>
  ) : (
    <ShellB dir={dir} active={active}>
      {children}
    </ShellB>
  );
}

/** Standard page padding inside either shell. */
export function PageBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <Container className={cn("py-6 sm:py-8 lg:py-10", className)}>{children}</Container>;
}

// A: sidebar on desktop, tab strip on phones.
function ShellA({ dir, active, children }: { dir: Dir; active: Section; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-line bg-white lg:flex lg:flex-col lg:px-4 lg:py-5">
        <Link href={`/${dir}`} className="rounded-ctl px-2">
          <Logo />
        </Link>
        <p className="mt-6 truncate px-2 text-xs font-medium text-muted">{business.name}</p>
        <nav aria-label="App" className="mt-2">
          <ul className="space-y-0.5">
            {nav.map((item) => (
              <li key={item.key}>
                <Link
                  href={`/${dir}/${item.href}`}
                  aria-current={item.key === active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-ctl px-2 py-2 text-sm",
                    item.key === active ? "bg-surface font-medium text-ink" : "text-muted hover:bg-surface hover:text-ink",
                  )}
                >
                  <item.icon size={16} aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto border-t border-line pt-4">
          <div className="flex items-center gap-2.5 px-2 text-sm">
            <span className="flex size-7 items-center justify-center rounded-full bg-sand text-xs font-semibold text-navy">
              DW
            </span>
            <span className="min-w-0 flex-1 truncate">{business.owner}</span>
            <Settings size={16} className="text-muted" aria-label="Settings" />
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-10 border-b border-line bg-white lg:hidden">
          <Container className="flex h-14 items-center justify-between">
            <Link href={`/${dir}`} className="rounded-ctl">
              <Logo />
            </Link>
            <button type="button" className="flex items-center gap-1.5 rounded-ctl px-2 py-1 text-sm text-muted">
              <Bell size={16} aria-hidden="true" />
              Alerts
            </button>
          </Container>
          <nav aria-label="App" className="overflow-x-auto">
            <ul className="flex gap-1 px-2">
              {nav.map((item) => (
                <li key={item.key} className="shrink-0">
                  <Link
                    href={`/${dir}/${item.href}`}
                    aria-current={item.key === active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm",
                      item.key === active ? "border-navy font-medium text-ink" : "border-transparent text-muted",
                    )}
                  >
                    <item.icon size={15} aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}

// B: navy top bar, bottom tabs on phones.
function ShellB({ dir, active, children }: { dir: Dir; active: Section; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface pb-20 md:pb-0">
      <header className="on-navy bg-navy text-white">
        <Container className="flex h-14 items-center justify-between gap-4">
          <Link href={`/${dir}`} className="rounded-ctl">
            <Logo />
          </Link>
          <nav aria-label="App" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.key}>
                  <Link
                    href={`/${dir}/${item.href}`}
                    aria-current={item.key === active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-1.5 rounded-ctl px-3 py-1.5 text-sm",
                      item.key === active ? "bg-white/12 font-medium text-white" : "text-white/75 hover:text-white",
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
            <button type="button" className="flex items-center gap-1.5 rounded-ctl text-sm text-white/80">
              <Bell size={16} aria-hidden="true" />
              <span className="sr-only md:not-sr-only">Alerts</span>
            </button>
            <span
              className="flex size-8 items-center justify-center rounded-full bg-sand text-xs font-semibold text-navy"
              title={business.owner}
            >
              DW
            </span>
          </div>
        </Container>
      </header>
      <main>{children}</main>
      <nav aria-label="App" className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white md:hidden">
        <ul className="grid grid-cols-4">
          {nav.slice(0, 4).map((item) => (
            <li key={item.key}>
              <Link
                href={`/${dir}/${item.href}`}
                aria-current={item.key === active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px]",
                  item.key === active ? "font-medium text-navy" : "text-muted",
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

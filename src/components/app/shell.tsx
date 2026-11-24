import Link from "next/link";
import {
  ChevronLeft,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Settings,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { isAdmin } from "@/lib/app/admin";
import { signOut } from "@/lib/plan/actions";
import { cn } from "@/lib/utils";

export type Section =
  | "dashboard"
  | "text-back"
  | "customers"
  | "videos"
  | "examples"
  | "checkout"
  | "report"
  | "settings";

// Everything a store does happens on the dashboard. Posts and the monthly report
// open from there, so the menu stays short. Examples is for the 2fish team only.
type NavItem = {
  key: Section;
  label: string;
  icon: typeof LayoutDashboard;
  href: string;
  team?: boolean;
};
const NAV: NavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    key: "examples",
    label: "Examples",
    icon: Lightbulb,
    href: "/dashboard/examples",
    // Open to everyone for now. Put `team: true` back to hide it from stores.
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
];
// Pages that live under the dashboard light up the Dashboard item.
const UNDER_DASHBOARD: Section[] = ["videos", "report"];

/** Link back to the dashboard, for the pages that open from it. */
export function BackToDashboard() {
  return (
    <Link
      href="/dashboard"
      className="mb-4 inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-night underline-offset-2 hover:underline print:hidden"
    >
      <ChevronLeft size={16} aria-hidden="true" />
      Dashboard
    </Link>
  );
}

/** Standard page padding inside the shell. */
export function PageBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Container className={cn("py-6 sm:py-8 lg:py-10", className)}>
      {children}
    </Container>
  );
}

// Night top bar, bottom tabs on phones.
export function AppShell({
  active,
  email,
  children,
}: {
  active: Section;
  email?: string;
  children: React.ReactNode;
}) {
  const initials = (email ?? "2f").slice(0, 2).toUpperCase();
  const nav = NAV.filter((n) => !n.team || isAdmin(email));
  const current = UNDER_DASHBOARD.includes(active) ? "dashboard" : active;
  return (
    <div className="min-h-dvh bg-surface pb-20 md:pb-0">
      <header className="on-night bg-night text-white print:hidden">
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
                    aria-current={item.key === current ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm",
                      item.key === current
                        ? "bg-night-deep font-semibold"
                        : "text-on-night-muted hover:text-white",
                    )}
                  >
                    <item.icon size={15} aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <form action={signOut} className="flex items-center gap-3">
            <span
              className="flex size-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-night"
              title={email}
            >
              {initials}
            </span>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-md text-sm text-on-night-muted hover:text-white"
            >
              <LogOut size={16} aria-hidden="true" />
              <span className="sr-only md:not-sr-only">Sign out</span>
            </button>
          </form>
        </Container>
      </header>
      <main className="overflow-x-clip">{children}</main>
      <nav
        aria-label="App"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white md:hidden print:hidden"
      >
        <ul
          className={cn(
            "grid",
            nav.length === 3 ? "grid-cols-3" : "grid-cols-2",
          )}
        >
          {nav.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={item.key === current ? "page" : undefined}
                className={cn(
                  "-mt-px flex flex-col items-center gap-1 border-t-2 py-2.5 text-sm",
                  item.key === current
                    ? "border-night bg-surface font-semibold text-night"
                    : "border-transparent text-muted-foreground",
                )}
              >
                <item.icon size={20} aria-hidden="true" />
                {item.key === "dashboard" ? "Home" : item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

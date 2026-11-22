import Link from "next/link";
import { FileText, LayoutDashboard, LogOut, Settings, ShoppingBag, Users, Video } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { signOut } from "@/lib/plan/actions";
import { cn } from "@/lib/utils";

export type Section = "dashboard" | "text-back" | "customers" | "videos" | "checkout" | "report" | "settings";

// `short` is the phone tab label; items without one stay off the phone bar.
const nav: { key: Section; label: string; short?: string; icon: typeof LayoutDashboard; href: string }[] = [
  { key: "dashboard", label: "Dashboard", short: "Home", icon: LayoutDashboard, href: "/dashboard" },
  { key: "videos", label: "Posts", short: "Posts", icon: Video, href: "/dashboard/videos" },
  { key: "checkout", label: "Checkout", short: "Checkout", icon: ShoppingBag, href: "/dashboard/checkout" },
  { key: "report", label: "Report", short: "Report", icon: FileText, href: "/dashboard/report" },
  { key: "customers", label: "Customers", icon: Users, href: "/dashboard/customers" },
  { key: "settings", label: "Settings", short: "Settings", icon: Settings, href: "/dashboard/settings" },
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
                    aria-current={item.key === active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm",
                      item.key === active ? "bg-night-deep font-semibold" : "text-on-night-muted hover:text-white",
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
            <span className="flex size-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-night" title={email}>
              {initials}
            </span>
            <button type="submit" className="flex items-center gap-1.5 rounded-md text-sm text-on-night-muted hover:text-white">
              <LogOut size={16} aria-hidden="true" />
              <span className="sr-only md:not-sr-only">Sign out</span>
            </button>
          </form>
        </Container>
      </header>
      <main className="overflow-x-clip">{children}</main>
      <nav aria-label="App" className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white md:hidden print:hidden">
        <ul className="grid grid-cols-5">
          {nav
            .filter((n) => n.short)
            .map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={item.key === active ? "page" : undefined}
                  className={cn(
                    "-mt-px flex flex-col items-center gap-1 border-t-2 py-2.5 text-sm",
                    item.key === active ? "border-night bg-surface font-semibold text-night" : "border-transparent text-muted-foreground",
                  )}
                >
                  <item.icon size={20} aria-hidden="true" />
                  {item.short}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </div>
  );
}

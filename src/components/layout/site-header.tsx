"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { HeaderUser } from "@/lib/auth/server";
import { ThemeToggle } from "./theme-toggle";
import { Container } from "./container";
import { UserMenu } from "./user-menu";
import { cn } from "@/lib/utils";

const PUBLIC_NAV = [
  { href: "/needs", label: "Browse needs" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/safety", label: "Safety" },
];

const APP_NAV = [
  { href: "/needs", label: "Browse needs" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/messages", label: "Messages" },
  { href: "/safety", label: "Safety" },
];

export function SiteHeader({ user, right }: { user: HeaderUser | null; right?: React.ReactNode }) {
  const pathname = usePathname();
  const nav = user ? APP_NAV : PUBLIC_NAV;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <Container className="flex h-14 items-center gap-4">
        <Link href="/" className="rounded-md" aria-label="2fish home">
          <Logo />
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  active && "text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {right}
          <ThemeToggle />
          {user ? (
            <>
              <Button className="hidden sm:inline-flex" render={<Link href="/needs/new" />}>
                Post a need
              </Button>
              <UserMenu user={user} />
            </>
          ) : (
            <>
              <Button variant="ghost" className="hidden sm:inline-flex" render={<Link href="/login" />}>
                Sign in
              </Button>
              <Button className="hidden sm:inline-flex" render={<Link href="/needs/new" />}>
                Post a need
              </Button>
            </>
          )}

          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />}>
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="px-5 pt-10">
                <Logo />
              </div>
              <nav className="flex flex-col px-3 pt-4" aria-label="Mobile">
                {nav.map((item) => (
                  <Link key={item.href} href={item.href} className="rounded-lg px-2 py-2.5 text-base text-foreground hover:bg-muted">
                    {item.label}
                  </Link>
                ))}
                {user && (
                  <Link href="/settings" className="rounded-lg px-2 py-2.5 text-base text-foreground hover:bg-muted">
                    Settings
                  </Link>
                )}
              </nav>
              <div className="mt-auto flex flex-col gap-2 p-5">
                {!user && (
                  <Button variant="outline" size="lg" render={<Link href="/login" />}>
                    Sign in
                  </Button>
                )}
                <Button size="lg" render={<Link href="/needs/new" />}>
                  Post a need
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}

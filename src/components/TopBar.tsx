"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { NAV, navLinkVariants } from "./Nav";
import { useBoard } from "./BoardProvider";
import { buttonVariants } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

export default function TopBar() {
  const { q, setQ, setDraftCategory } = useBoard();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 bg-brand-surface pt-[env(safe-area-inset-top)] text-brand-surface-foreground shadow-card on-primary">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 md:gap-4 md:px-6 md:py-3">
        <Link href="/" className="flex flex-none items-center gap-2 rounded-md text-inherit no-underline" aria-label="2fish home">
          <span className="grid size-10 flex-none place-items-center rounded-md bg-logo-body">
            <Logo size={32} />
          </span>
          <b className="hidden text-2xl font-black tracking-tight min-[360px]:block">2fish</b>
        </Link>

        {/* on phones the bottom bar handles navigation */}
        <nav className="hidden gap-1 md:flex" aria-label="Sections">
          {NAV.map((t) => (
            <Link key={t.href} href={t.href} aria-current={pathname === t.href ? "page" : undefined} className={navLinkVariants()}>
              {t.label}
            </Link>
          ))}
        </nav>

        <label className="relative min-w-0 flex-1 md:max-w-sm lg:ml-auto">
          <span className="sr-only">Search needs</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 opacity-80" />
          <Input
            type="search"
            tone="onPrimary"
            size="sm"
            withIcon
            placeholder="Search needs"
            autoComplete="off"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              if (pathname !== "/") router.push("/");
            }}
          />
        </label>

        <ThemeToggle />

        <Link
          href="/post"
          onClick={() => setDraftCategory(null)}
          className={cn(buttonVariants({ variant: "inverse", size: "sm" }), "hidden md:inline-flex")}
        >
          <Plus aria-hidden="true" />
          Post a need
        </Link>
      </div>
    </header>
  );
}

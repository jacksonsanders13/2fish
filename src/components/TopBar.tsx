"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";
import { NAV, navLinkVariants } from "./Tabs";
import { useBoard } from "./BoardProvider";
import { buttonVariants } from "./ui/button";
import { Input } from "./ui/input";

export default function TopBar() {
  const { q, setQ, setDraftCategory } = useBoard();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 bg-brand-surface text-brand-surface-foreground shadow-card on-primary">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 md:px-6 md:py-3">
        <Link href="/" className="flex items-center gap-2 rounded-md text-inherit no-underline" aria-label="2fish home">
          <span className="grid size-10 flex-none place-items-center rounded-md bg-logo-body">
            <Logo size={32} />
          </span>
          <b className="text-2xl font-black tracking-tight">2fish</b>
        </Link>

        <nav className="hidden gap-1 md:flex" aria-label="Main">
          {NAV.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              aria-current={pathname === t.href ? "page" : undefined}
              className={navLinkVariants({ tone: "onPrimary" })}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        {/* full-width second row on phones, inline on wider screens */}
        <label className="relative order-last w-full sm:order-none sm:w-auto sm:min-w-0 sm:flex-1 md:max-w-sm lg:ml-auto">
          <span className="sr-only">Search needs</span>
          <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg">
            ⌕
          </span>
          <Input
            type="search"
            tone="onPrimary"
            size="sm"
            placeholder="Search needs"
            autoComplete="off"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              if (pathname !== "/") router.push("/");
            }}
            withIcon
          />
        </label>

        <Link
          href="/post"
          onClick={() => setDraftCategory(null)}
          className={`ml-auto sm:ml-0 ${buttonVariants({ variant: "inverse", size: "sm" })}`}
        >
          + Post a need
        </Link>
      </div>
    </header>
  );
}

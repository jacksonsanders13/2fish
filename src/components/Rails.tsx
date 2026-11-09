"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { Wordmark } from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { NAV, railLinkVariants } from "./Nav";
import { SearchField } from "./TopBar";
import { AreaCard, SafetyCard, StatsCard } from "./AreaWidgets";
import { useBoard } from "./BoardProvider";
import { buttonVariants } from "./ui/button";
import { Text } from "./ui/typography";

// Desktop left column: brand, navigation, the big Post button.
export function LeftRail() {
  const pathname = usePathname();
  const { setDraftCategory } = useBoard();
  return (
    <header className="sticky top-0 hidden h-dvh w-64 flex-none flex-col gap-2 px-4 py-6 lg:flex">
      <Link href="/" className="mb-4 self-start rounded-md px-2 text-foreground no-underline" aria-label="2fish home">
        <Wordmark size={36} />
      </Link>
      <nav aria-label="Main" className="grid gap-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={railLinkVariants()}>
            <Icon aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
      <Link href="/post" onClick={() => setDraftCategory(null)} className={buttonVariants({ variant: "primary", size: "lg", block: true })}>
        <Plus aria-hidden="true" />
        Post a need
      </Link>
      <div className="mt-auto grid gap-2">
        <ThemeToggle withLabel />
        <Text variant="meta" className="px-4">
          A little is enough.
        </Text>
      </div>
    </header>
  );
}

// Desktop right column: search, your area, numbers, safety.
export function RightRail() {
  return (
    <aside aria-label="Search and area" className="sticky top-0 hidden h-dvh w-80 flex-none content-start gap-4 overflow-y-auto px-6 py-6 xl:grid">
      <SearchField id="search-rail" />
      <AreaCard />
      <StatsCard />
      <SafetyCard />
    </aside>
  );
}

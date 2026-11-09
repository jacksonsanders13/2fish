"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Wordmark } from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { useBoard } from "./BoardProvider";
import { Input } from "./ui/input";

// Search field shared by the phone top bar and the desktop right rail.
export function SearchField({ id }: { id: string }) {
  const { q, setQ } = useBoard();
  const router = useRouter();
  const pathname = usePathname();
  return (
    <label htmlFor={id} className="relative block min-w-0 flex-1">
      <span className="sr-only">Search needs</span>
      <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        type="search"
        tone="search"
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
  );
}

// Phone/tablet header. From lg the left rail has the logo and theme switch,
// so only search stays; from xl search moves to the right rail.
export default function TopBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur xl:hidden">
      <div className="flex items-center gap-3 px-4 py-2">
        <Link href="/" className="flex-none rounded-md text-foreground no-underline lg:hidden" aria-label="2fish home">
          <Wordmark size={30} />
        </Link>
        <SearchField id="search-top" />
        <div className="lg:hidden">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

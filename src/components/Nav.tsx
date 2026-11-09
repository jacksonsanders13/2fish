"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cva } from "class-variance-authority";
import { HeartHandshake, House, Plus } from "lucide-react";
import { useBoard } from "./BoardProvider";

export const NAV = [
  { href: "/", label: "Feed" },
  { href: "/activity", label: "My activity" },
] as const;

// Top bar links (md and up). Current page follows aria-current.
export const navLinkVariants = cva(
  "inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-4 font-extrabold no-underline transition-colors duration-200 ease-smooth text-brand-surface-foreground/85 hover:bg-brand-surface-foreground/10 hover:text-brand-surface-foreground aria-[current=page]:bg-brand-surface-foreground/15 aria-[current=page]:text-brand-surface-foreground",
);

const tabVariants = cva(
  "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-extrabold no-underline transition-colors duration-200 ease-smooth [&_svg]:size-6",
  {
    variants: {
      kind: {
        // regular tab; the current page turns primary
        tab: "text-muted-foreground hover:text-foreground aria-[current=page]:text-primary-soft-foreground",
        // the raised round "Post" button in the middle
        action: "text-foreground aria-[current=page]:text-success-soft-foreground",
      },
    },
    defaultVariants: { kind: "tab" },
  },
);

// Phone and tablet navigation, fixed to the bottom where thumbs reach.
export function BottomNav() {
  const pathname = usePathname();
  const { setDraftCategory } = useBoard();
  const current = (href: string) => (pathname === href ? "page" : undefined);

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-pop backdrop-blur md:hidden"
    >
      <div className="mx-auto flex max-w-md items-end px-4">
        <Link href="/" aria-current={current("/")} className={tabVariants()}>
          <House aria-hidden="true" />
          Feed
        </Link>
        <Link
          href="/post"
          aria-current={current("/post")}
          onClick={() => setDraftCategory(null)}
          className={tabVariants({ kind: "action" })}
        >
          <span className="-mt-6 grid size-14 place-items-center rounded-full bg-success text-success-foreground shadow-glow-success ring-4 ring-surface hover-scale">
            <Plus aria-hidden="true" strokeWidth={3} />
          </span>
          Post a need
        </Link>
        <Link href="/activity" aria-current={current("/activity")} className={tabVariants()}>
          <HeartHandshake aria-hidden="true" />
          My activity
        </Link>
      </div>
    </nav>
  );
}

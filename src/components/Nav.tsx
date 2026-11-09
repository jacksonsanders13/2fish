"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cva } from "class-variance-authority";
import { HeartHandshake, House, Plus, type LucideIcon } from "lucide-react";
import { useBoard } from "./BoardProvider";

export const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Feed", icon: House },
  { href: "/activity", label: "My activity", icon: HeartHandshake },
];

// Left rail links (desktop). Current page goes bold and filled.
export const railLinkVariants = cva(
  "inline-flex min-h-12 items-center gap-4 rounded-full px-4 text-lg font-semibold text-foreground no-underline transition-colors duration-200 ease-smooth hover:bg-muted aria-[current=page]:font-extrabold [&_svg]:size-6",
);

const tabVariants = cva(
  "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-muted-foreground no-underline transition-colors duration-200 ease-smooth hover:text-foreground aria-[current=page]:text-foreground [&_svg]:size-6",
);

// Phone and tablet navigation, fixed to the bottom where thumbs reach.
export function BottomNav() {
  const pathname = usePathname();
  const { setDraftCategory } = useBoard();
  const current = (href: string) => (pathname === href ? "page" : undefined);
  const [feed, activity] = NAV;

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-center px-6">
        <Link href={feed.href} aria-current={current(feed.href)} className={tabVariants()}>
          <feed.icon aria-hidden="true" />
          {feed.label}
        </Link>
        <Link href="/post" aria-current={current("/post")} onClick={() => setDraftCategory(null)} className={tabVariants()}>
          <span className="grid h-9 w-12 place-items-center rounded-xl bg-primary text-primary-foreground hover-scale [&_svg]:size-5">
            <Plus aria-hidden="true" strokeWidth={3} />
          </span>
          Post
        </Link>
        <Link href={activity.href} aria-current={current(activity.href)} className={tabVariants()}>
          <activity.icon aria-hidden="true" />
          {activity.label}
        </Link>
      </div>
    </nav>
  );
}

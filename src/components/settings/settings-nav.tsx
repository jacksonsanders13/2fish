"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/settings", label: "Profile" },
  { href: "/settings/account", label: "Account & sign-in" },
  { href: "/settings/blocked", label: "Blocked people" },
  { href: "/settings/data", label: "Your data" },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col" aria-label="Settings">
      {ITEMS.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          aria-current={pathname === i.href ? "page" : undefined}
          className={cn(
            "shrink-0 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
            pathname === i.href && "bg-muted font-medium text-foreground",
          )}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}

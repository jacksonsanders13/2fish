import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";

export const NAV = [
  { href: "/", label: "Feed" },
  { href: "/activity", label: "My activity" },
] as const;

export type NavHref = (typeof NAV)[number]["href"];

// The current page is marked with aria-current, and the style follows it.
export const navLinkVariants = cva(
  "inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-4 font-extrabold no-underline transition-colors duration-200 ease-smooth",
  {
    variants: {
      tone: {
        default:
          "text-muted-foreground hover:bg-muted hover:text-foreground aria-[current=page]:bg-foreground aria-[current=page]:text-background",
        onPrimary:
          "text-brand-surface-foreground/85 hover:bg-brand-surface-foreground/10 hover:text-brand-surface-foreground aria-[current=page]:bg-brand-surface-foreground/15 aria-[current=page]:text-brand-surface-foreground",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

// In-page section tabs. Phones only; on wider screens the same links sit in the top bar.
export default function Tabs({ active, tone }: { active: NavHref } & VariantProps<typeof navLinkVariants>) {
  return (
    <nav className="flex gap-2 overflow-x-auto md:hidden" aria-label="Sections">
      {NAV.map((t) => (
        <Link key={t.href} href={t.href} aria-current={active === t.href ? "page" : undefined} className={navLinkVariants({ tone })}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

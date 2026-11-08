import Link from "next/link";

const TABS = [
  { href: "/", label: "Feed" },
  { href: "/activity", label: "My activity" },
];

export default function Tabs({ active }: { active: "/" | "/activity" }) {
  return (
    <nav className="flex gap-1.5 overflow-x-auto" aria-label="Sections">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={active === t.href ? "page" : undefined}
          className={`whitespace-nowrap rounded-full px-3.5 py-2 font-extrabold no-underline ${
            active === t.href ? "bg-ink text-surface" : "text-muted"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

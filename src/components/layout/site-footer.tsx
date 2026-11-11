import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SITE } from "@/lib/site";
import { Container } from "./container";

const GROUPS = [
  {
    title: "Product",
    links: [
      { href: "/needs", label: "Browse needs" },
      { href: "/needs/new", label: "Post a need" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/safety", label: "Safety" },
      { href: `mailto:${SITE.supportEmail}`, label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-background">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            A neighborhood giving board. Post exactly what you need; neighbors nearby make it happen.
          </p>
          <p className="mt-4 text-sm font-medium text-brand-text">{SITE.tagline}</p>
        </div>
        {GROUPS.map((g) => (
          <div key={g.title}>
            <h3 className="text-sm font-semibold">{g.title}</h3>
            <ul className="mt-3 space-y-2">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t border-border/70">
        <Container className="flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} 2fish. Built in {SITE.city}.</p>
          <p>Free for neighbors. Always.</p>
        </Container>
      </div>
    </footer>
  );
}

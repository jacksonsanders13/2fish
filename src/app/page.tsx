import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";

// Review hub for the Phase 1 mockup. Links to every screen in both directions.
const directions = [
  {
    key: "a",
    name: "Ledger",
    blurb: "White, serif headlines, hairlines. Calm and bank-like. Sidebar dashboard.",
  },
  {
    key: "b",
    name: "Harbor",
    blurb: "Navy hero and app chrome, grotesque headlines, bigger radius. Card dashboard with bottom tabs on phones.",
  },
];

const screens = [
  { label: "Landing page", path: "" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Audit questionnaire", path: "/audit" },
  { label: "Results", path: "/results" },
  { label: "Video step", path: "/videos" },
  { label: "Missed-call text-back step", path: "/text-back" },
];

export default function Home() {
  return (
    <main className="min-h-dvh bg-white">
      <Container className="max-w-3xl py-12 sm:py-20">
        <Logo />
        <h1 className="mt-8 font-display text-4xl tracking-tight sm:text-5xl">Phase 1 mockup</h1>
        <p className="mt-3 text-lg text-muted">
          Two visual directions, same copy and the same fake data. Open each on your phone. Nothing is connected
          to a backend.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {directions.map((d) => (
            <section key={d.key} className="rounded-card border border-line p-5">
              <p className="text-sm text-muted">Direction {d.key.toUpperCase()}</p>
              <h2 className="font-display text-2xl tracking-tight">{d.name}</h2>
              <p className="mt-1 text-sm text-muted">{d.blurb}</p>
              <ul className="mt-4 divide-y divide-line">
                {screens.map((s) => (
                  <li key={s.path}>
                    <Link
                      href={`/${d.key}${s.path}`}
                      className="flex items-center justify-between py-2.5 text-sm hover:underline"
                    >
                      {s.label}
                      <ChevronRight size={16} className="text-muted" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted">Design decisions are in DESIGN.md in the repo.</p>
      </Container>
    </main>
  );
}

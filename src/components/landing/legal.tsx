import { Container } from "@/components/ui/container";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export type LegalSection = { heading: string; body: string[] };

// Terms and Privacy share this layout: plain headings, short paragraphs.
export function LegalPage({ title, updated, intro, sections }: { title: string; updated: string; intro: string; sections: LegalSection[] }) {
  return (
    <>
      <SiteHeader />
      <main>
        <Container className="max-w-2xl py-14 sm:py-20">
          <h1 className="text-display text-ink">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated {updated}</p>
          <p className="mt-6">{intro}</p>
          {sections.map((s) => (
            <section key={s.heading} className="mt-10">
              <h2 className="font-semibold">{s.heading}</h2>
              {s.body.map((p) => (
                <p key={p} className="mt-3">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}

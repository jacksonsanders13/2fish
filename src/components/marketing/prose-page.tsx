import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Container } from "@/components/layout/container";

// Shared shell for About / Safety / Privacy / Terms.
export function ProsePage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="relative">
        <div className="glow-amber pointer-events-none absolute inset-x-0 top-0 h-72" />
        <Container size="sm" className="relative py-16 sm:py-24">
          {eyebrow && <p className="text-sm font-medium text-brand-text">{eyebrow}</p>}
          <h1 className="text-display mt-2 text-4xl font-semibold sm:text-5xl">{title}</h1>
          {intro && <p className="mt-5 text-lg text-muted-foreground">{intro}</p>}
          <div className="prose-2fish mt-10">{children}</div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}

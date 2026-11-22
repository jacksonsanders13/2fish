import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { PostsCalculator } from "./calculator";
import { DashboardPreview } from "./dashboard-preview";
import { features, loop, StepSnippet } from "./loop";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

// Landing page, laid out as a funnel: the leak, the plan, the work, then the ask.
// Only the hero animates in. Everything below is just there when you scroll to it.
export function Landing() {
  return (
    <>
      <SiteHeader />
      <main className="overflow-x-clip">
        {/* Hero: copy on the left, the product on the right */}
        <section className="border-b border-line">
          <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-12">
            <div className="min-w-0">
              <h1 className="rise text-display text-ink">Daily posts for your store, and proof of what they sold</h1>
              <p className="rise mt-6 max-w-xl" style={{ "--rise-delay": "0.1s" } as React.CSSProperties}>
                Send us your product photos and clips. Every Monday you get 7 posts to approve in one tap. Each
                one carries its own promo code, so your monthly report shows the sales it brought into the store.
              </p>
              <div
                className="rise mt-8 flex flex-col gap-3 sm:flex-row"
                style={{ "--rise-delay": "0.2s" } as React.CSSProperties}
              >
                <Button asChild size="lg" variant="signal" className="h-12 px-5 text-base">
                  <Link href="/audit">
                    Grade my store free
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-5 text-base">
                  <a href="#how">See how it works</a>
                </Button>
              </div>
            </div>
            <div
              className="rise min-w-0 rounded-md bg-night p-3 sm:p-6"
              style={{ "--rise-delay": "0.3s" } as React.CSSProperties}
            >
              <DashboardPreview chrome="light" />
              <p className="mt-3 text-sm text-on-night-muted">Sample store: Linden Row Boutique, Raleigh. Made up for this page.</p>
            </div>
          </Container>
        </section>

        {/* What posting is worth */}
        <Step id="cost">
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
            <div>
              <h2 className="text-display">What a week of posts could bring in</h2>
              <p className="mt-5 max-w-md">
                Most small stores post when there&apos;s a spare minute between customers, then can&apos;t tell if
                any of it sold. Give every post its own code and the register tells you.
              </p>
              <StepLink href="/audit" className="mt-6">
                See how your store scores
              </StepLink>
            </div>
            <div className="rounded-md bg-surface p-5 sm:p-8">
              <PostsCalculator />
            </div>
          </div>
        </Step>

        {/* How it works */}
        <Step id="how">
          <h2 className="max-w-2xl text-display">The marketing help big brands pay for, built for your store</h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-2 lg:gap-x-12">
            {loop.map((step) => (
              <li key={step.n} className="min-w-0">
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm">{step.body}</p>
                <StepSnippet n={step.n as 1 | 2 | 3 | 4} className="mt-5" />
              </li>
            ))}
          </ol>
          <StepLink href="/audit" className="mt-10">
            Get your store&apos;s score
          </StepLink>
        </Step>

        {/* The work, and what it costs */}
        <Step id="pricing">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div>
              <h2 className="text-display">2fish does the posting for you</h2>
              <dl className="mt-8 space-y-6">
                {features.map((f) => (
                  <div key={f.title} className="grid gap-1 sm:grid-cols-[1fr_auto] sm:gap-6">
                    <div>
                      <dt className="font-semibold">{f.title}</dt>
                      <dd className="mt-1 text-sm">{f.body}</dd>
                    </div>
                    <dd className="text-sm text-muted-foreground sm:pt-1 sm:text-right">{f.when}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="self-start overflow-hidden rounded-md">
              <div className="bg-surface p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-semibold">Store Grader</h3>
                  <span className="num font-semibold">Free</span>
                </div>
                <p className="mt-1 text-sm">Your score out of 100 and three fixes for your store.</p>
              </div>
              <div className="on-night bg-night p-5 text-white">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-semibold">Plans</h3>
                  <span className="num font-semibold">From $79 a month</span>
                </div>
                <p className="mt-1 text-sm text-on-night-muted">
                  Starter $79: 7 posts a week, codes, the monthly proof report. Growth $149: adds Google profile
                  posts and review replies. Done-with-you $299: adds a monthly call and a person checking every
                  post.
                </p>
                <p className="mt-2 text-sm text-on-night-muted">
                  First 10 Raleigh-area stores: $49 a month for life.
                </p>
                <ul className="mt-4 space-y-1.5 text-sm">
                  {[
                    "If tracked sales don't cover your plan in 60 days, the next month is free",
                    "Month to month, cancel any time",
                  ].map((x) => (
                    <li key={x} className="flex gap-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-cash-bright" aria-hidden="true" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Step>

        {/* The ask, on the one dark band */}
        <section className="on-night bg-night text-white">
          <Container className="grid gap-8 py-16 lg:grid-cols-[1fr_auto] lg:items-end lg:py-24">
            <h2 className="max-w-2xl text-display text-white">Bring what you have and we&apos;ll multiply it</h2>
            <Button asChild size="lg" variant="signal" className="h-12 w-full px-5 text-base sm:w-auto">
              <Link href="/audit">
                Grade my store free
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

// One section of the funnel. The heading leads; one rule separates it from the next.
function Step({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-line">
      <Container className="py-16 lg:py-24">{children}</Container>
    </section>
  );
}

// Small call to action at the end of each step.
function StepLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 font-semibold text-night underline decoration-2 underline-offset-4 hover:text-night-tint",
        className,
      )}
    >
      {children}
      <ArrowRight size={16} aria-hidden="true" />
    </Link>
  );
}

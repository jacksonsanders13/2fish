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
              <h1 className="rise text-display text-ink">Daily posts, and proof they sold</h1>
              <p className="rise mt-6 max-w-xl" style={{ "--rise-delay": "0.1s" } as React.CSSProperties}>
                7 posts every Monday from your photos, and a monthly report on what they sold.
              </p>
              <div
                className="rise mt-8 flex flex-col gap-3 sm:flex-row"
                style={{ "--rise-delay": "0.2s" } as React.CSSProperties}
              >
                <Button asChild size="lg" variant="signal" className="h-12 px-5 text-base">
                  <Link href="/audit">
                    Get your free store grade
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
                any of it sold. Count what the posts showed and ask who saw them, and you know.
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
                  // dt and dd sit directly in the div so screen readers read it as one item
                  <div key={f.title} className="grid gap-1 sm:grid-cols-[1fr_auto] sm:gap-x-6">
                    <dt className="font-semibold">{f.title}</dt>
                    <dd className="text-sm">{f.body}</dd>
                    <dd className="text-sm text-muted-foreground sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:pt-1 sm:text-right">
                      {f.when}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="self-start rounded-md bg-surface p-5">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-semibold">Store Grader</h3>
                <span className="num font-semibold">Free</span>
              </div>
              <p className="mt-1 text-sm">Your score out of 100 and three fixes for your store. No card, no account.</p>
            </div>
          </div>

          {/* The three plans, each on its own. Growth is the one most stores should pick, so it's the orange one. */}
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {plans.map((p) => (
              <li
                key={p.name}
                className={cn(
                  "flex flex-col rounded-md p-5",
                  p.pick ? "on-night bg-signal text-white" : "bg-surface",
                )}
              >
                <h3 className="font-semibold">{p.name}</h3>
                <p className="mt-2">
                  <span className="num text-display font-semibold">${p.price}</span>
                  <span className={cn("text-sm", p.pick ? "text-white" : "text-muted-foreground")}> a month</span>
                </p>
                <p className={cn("mt-1 text-sm", p.pick ? "text-white" : "text-muted-foreground")}>{p.who}</p>
                <ul className="mt-4 space-y-1.5 text-sm">
                  {p.items.map((x) => (
                    <li key={x} className="flex gap-2">
                      <Check
                        size={16}
                        className={cn("mt-0.5 shrink-0", p.pick ? "text-white" : "text-night")}
                        aria-hidden="true"
                      />
                      {x}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Step>

        {/* The ask, on the one dark band */}
        <section className="on-night bg-night text-white">
          <Container className="grid gap-8 py-16 lg:grid-cols-[1fr_auto] lg:items-end lg:py-24">
            <h2 className="max-w-2xl text-display text-white">Bring what you have and we&apos;ll multiply it</h2>
            <Button asChild size="lg" variant="signal" className="h-12 w-full px-5 text-base sm:w-auto">
              <Link href="/audit">
                Get your free store grade
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

const plans = [
  {
    name: "Starter",
    price: 79,
    who: "For stores that need to post every day",
    items: ["7 posts a week from your photos", "Reads your Square sales", "Monthly report on what sold"],
    pick: false,
  },
  {
    name: "Growth",
    price: 149,
    who: "The one we'd pick for most stores",
    items: [
      "Everything in Starter",
      "Texts you when posts are ready",
      "Learns what sells and makes more of it",
      "Posts to Instagram for you (after launch)",
    ],
    pick: true,
  },
  {
    name: "Pro",
    price: 299,
    who: "For busy stores and owners with more than one shop",
    items: [
      "Everything in Growth",
      "Plans holiday and sale pushes ahead of time",
      "Google posts and review replies (after launch)",
      "Answers Instagram DMs and comments (after launch)",
      "Up to 3 store locations",
    ],
    pick: false,
  },
];

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

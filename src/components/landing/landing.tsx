import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { PostsCalculator } from "./calculator";
import { DashboardPreview } from "./dashboard-preview";
import { loop, StepSnippet } from "./loop";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { WaitlistForm } from "./waitlist-form";

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
                Posts made from your photos every week, a calendar that plans them, and a monthly report on what they sold.
              </p>
              <div
                className="rise mt-8 flex flex-col gap-3 sm:flex-row"
                style={{ "--rise-delay": "0.2s" } as React.CSSProperties}
              >
                <Button asChild size="lg" variant="signal" className="h-12 px-5 text-base">
                  <a href="#waitlist">
                    Join the waitlist
                    <ArrowRight aria-hidden="true" />
                  </a>
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
                any of it sold. 2fish reads your Square sales and shows you which posts did.
              </p>
              <StepLink href="#waitlist" className="mt-6">
                Join the waitlist
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
          <StepLink href="#waitlist" className="mt-10">
            Join the waitlist
          </StepLink>
        </Step>

        {/* The work, and what it costs */}
        <Step id="pricing">
          <h2 className="max-w-2xl text-display">2fish does the posting for you</h2>
          <p className="mt-4 max-w-xl">Planned pricing for launch. Month to month, cancel any time.</p>

          {/* The three plans, each with its own button. Growing is the pick, marked in light coral. */}
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {plans.map((p) => (
              <li
                key={p.name}
                className={cn("flex flex-col rounded-md p-5", p.pick ? "border-2 border-signal bg-signal-soft" : "border-2 border-transparent bg-surface")}
              >
                <h3 className="font-semibold">
                  {p.name}
                  {p.pick ? <span className="ml-2 text-sm font-semibold text-signal-tint">Most stores pick this</span> : null}
                </h3>
                <p className="mt-2">
                  <span className="num text-display font-semibold">${p.price}</span>
                  <span className="text-sm text-muted-foreground"> a month</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{p.who}</p>
                <ul className="mt-4 space-y-1.5 text-sm">
                  {p.items.map((x) => (
                    <li key={x} className="flex gap-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-night" aria-hidden="true" />
                      {x}
                    </li>
                  ))}
                </ul>
                <Button asChild size="lg" variant={p.pick ? "signal" : "outline"} className="mt-6 h-12 w-full text-base">
                  <a href="#waitlist">Join the waitlist</a>
                </Button>
              </li>
            ))}
          </ul>
        </Step>

        {/* The ask, on the one dark band: the waitlist */}
        <section id="waitlist" className="on-night scroll-mt-20 bg-night text-white">
          <Container className="grid gap-10 py-16 lg:grid-cols-[1fr_1fr] lg:items-start lg:py-24">
            <div>
              <h2 className="max-w-2xl text-display text-white">Bring what you have and we&apos;ll multiply it</h2>
              <p className="mt-4 max-w-md text-on-night-muted">
                2fish is opening to small stores soon. Join the waitlist and you&apos;ll hear first when it&apos;s ready.
              </p>
            </div>
            <WaitlistForm />
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

const plans = [
  {
    name: "Solo",
    price: 20,
    who: "For one-person shops and side businesses",
    items: ["3 posts a week from your photos", "A calendar of what posts when", "Monthly marketing grade", "Chat with your 2fish consultant"],
    pick: false,
  },
  {
    name: "Growing",
    price: 50,
    who: "For stores ready to grow from what sells",
    items: [
      "Everything in Solo",
      "7 posts a week",
      "Graph of your sales vs. your posts",
      "Texts you when posts are ready",
      "Learns what sells and makes more of it",
    ],
    pick: true,
  },
  {
    name: "Established",
    price: 75,
    who: "For busy shops, restaurants and owners with more than one location",
    items: ["Everything in Growing", "Plans holiday and sale pushes ahead of time", "More time with your consultant", "Up to 3 locations"],
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

import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Money } from "@/components/ui/money";
import { MissedCallCalculator } from "./calculator";
import { DashboardPreview } from "./dashboard-preview";
import { features, loop, StepSnippet } from "./loop";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import type { Dir } from "@/lib/utils";

// Direction A, "Ledger". White, serif headlines, hairlines, no shadows.
export function LandingA({ dir }: { dir: Dir }) {
  return (
    <>
      <SiteHeader dir={dir} />
      <main>
        {/* Hero */}
        <section>
          <Container className="pt-14 pb-10 sm:pt-20 sm:pb-12">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-muted">For local businesses with 1 to 9 employees</p>
              <h1 className="mt-4 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                Find the money your business is losing. <span className="italic">Then get it back.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted">
                2fish is an AI growth consultant for local businesses. Take a 5-minute audit, get a plan, and let
                2fish do the work, from texting back missed calls to turning your phone clips into a week of
                videos.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href={`/${dir}/audit`} size="lg">
                  Start your free audit
                  <ArrowRight size={18} aria-hidden="true" />
                </Button>
                <Button href={`/${dir}/dashboard`} size="lg" variant="secondary">
                  See a sample plan
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted">Free. No card. About 5 minutes.</p>
            </div>
          </Container>
        </section>

        {/* Product shot */}
        <section aria-label="Sample dashboard">
          <Container>
            <div className="rounded-card bg-sand p-3 sm:p-6 lg:p-8">
              <DashboardPreview />
            </div>
            <p className="mt-3 text-sm text-muted">
              The dashboard for a Raleigh power washing company. Sample data.
            </p>
          </Container>
        </section>

        {/* The loop */}
        <section id="how" className="mt-16 border-t border-line sm:mt-24">
          <Container className="grid gap-10 py-16 lg:grid-cols-[1fr_1.3fr] lg:gap-20 lg:py-24">
            <div className="lg:sticky lg:top-10 lg:self-start">
              <p className="text-sm font-medium text-muted">How it works</p>
              <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
                Consultants help McDonald&apos;s. We help you.
              </h2>
              <p className="mt-5 max-w-md text-lg text-muted">
                Big firms charge big companies to find where money leaks out and fix it. 2fish does the same four
                things for a shop with two trucks. And it does the fixing itself.
              </p>
            </div>
            <ol className="space-y-14">
              {loop.map((step) => (
                <li key={step.n} className="grid gap-4 sm:grid-cols-[3.5rem_1fr]">
                  <span className="num font-display text-3xl text-muted">0{step.n}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-muted">{step.name}</p>
                    <h3 className="mt-1 font-display text-2xl tracking-tight sm:text-3xl">{step.title}</h3>
                    <p className="mt-3 max-w-lg text-muted">{step.body}</p>
                    <StepSnippet n={step.n} className="mt-6 max-w-md" />
                  </div>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* Calculator */}
        <section id="cost" className="border-t border-line bg-surface">
          <Container className="grid items-start gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
            <div>
              <p className="text-sm font-medium text-muted">The biggest leak</p>
              <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
                What a missed call costs you.
              </h2>
              <p className="mt-5 max-w-md text-lg text-muted">
                Power washers, landscapers and cleaners miss a lot of calls because they&apos;re working. Most of
                those callers don&apos;t leave a voicemail. They call the next name on the list.
              </p>
              <p className="mt-4 max-w-md text-muted">
                Move the slider to see what that costs at your prices. 2fish texts back within 10 seconds so the
                caller waits for you instead.
              </p>
            </div>
            <MissedCallCalculator dir={dir} />
          </Container>
        </section>

        {/* What it does */}
        <section className="border-t border-line">
          <Container className="py-16 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-muted">What 2fish does for you</p>
              <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
                Not advice. The actual work.
              </h2>
              <p className="mt-5 text-lg text-muted">
                Each step in your plan is something 2fish carries out. You approve it, it runs, and the result
                shows up on your dashboard.
              </p>
            </div>
            <dl className="mt-10 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title} className="bg-white p-6">
                  <dt className="font-medium">{f.title}</dt>
                  <dd className="mt-2 text-sm text-muted">{f.body}</dd>
                  <dd className="mt-4 text-xs text-muted">{f.when}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-t border-line bg-surface">
          <Container className="grid gap-10 py-16 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:py-24">
            <div>
              <p className="text-sm font-medium text-muted">Pricing</p>
              <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
                Free to find the leaks. Pay when 2fish fixes them.
              </h2>
              <p className="mt-5 max-w-md text-lg text-muted">
                The audit and the plan cost nothing, ever. Pro is for the work.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-card border border-line bg-white p-6">
                <h3 className="font-medium">Free</h3>
                <p className="mt-2 font-display text-4xl tracking-tight">
                  <Money amount={0} tone="ink" />
                </p>
                <ul className="mt-5 space-y-2 text-sm">
                  {["The 5-minute audit", "Your ranked plan", "Monthly plan updates", "Missed-call calculator"].map((x) => (
                    <li key={x} className="flex gap-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-navy" aria-hidden="true" />
                      {x}
                    </li>
                  ))}
                </ul>
                <Button href={`/${dir}/audit`} variant="secondary" className="mt-6 w-full">
                  Start the audit
                </Button>
              </div>
              <div className="rounded-card border border-navy bg-white p-6">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium">Pro</h3>
                  <span className="rounded-full bg-sand px-2 py-0.5 text-xs">Placeholder price</span>
                </div>
                <p className="mt-2 font-display text-4xl tracking-tight">
                  <Money amount={79} tone="ink" />
                  <span className="text-base text-muted"> a month</span>
                </p>
                <ul className="mt-5 space-y-2 text-sm">
                  {[
                    "Everything in Free",
                    "Missed-call text-back",
                    "Review requests after every job",
                    "7 videos a week from your clips",
                    "Past-customer reminders",
                  ].map((x) => (
                    <li key={x} className="flex gap-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-navy" aria-hidden="true" />
                      {x}
                    </li>
                  ))}
                </ul>
                <Button href={`/${dir}/audit`} className="mt-6 w-full">
                  Start with the free audit
                </Button>
              </div>
            </div>
          </Container>
        </section>

        {/* Closing */}
        <section className="on-navy bg-navy text-white">
          <Container className="grid items-center gap-8 py-16 lg:grid-cols-[1.2fr_1fr] lg:py-24">
            <div>
              <h2 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
                Bring what you have. We&apos;ll multiply it.
              </h2>
              <p className="mt-4 max-w-md text-lg text-on-navy-muted">
                Five minutes of questions. A plan ranked by dollars. The work done for you.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Button href={`/${dir}/audit`} size="lg" variant="inverse">
                Start your free audit
              </Button>
              <Button href={`/${dir}/dashboard`} size="lg" variant="outline-inverse">
                See a sample plan
              </Button>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter dir={dir} />
    </>
  );
}

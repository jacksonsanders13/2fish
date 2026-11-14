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

// Direction B, "Harbor". Navy hero, grotesque headlines, bigger radius.
export function LandingB({ dir }: { dir: Dir }) {
  return (
    <>
      <SiteHeader dir={dir} tone="navy" />
      <main>
        {/* Hero on navy, dashboard shot hanging over the edge */}
        <section className="on-navy bg-navy text-white">
          <Container className="pt-14 sm:pt-20">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-on-navy-muted">For local businesses with 1 to 9 employees</p>
              <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
                Find the money your business is losing. Then get it back.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-on-navy-muted">
                2fish is an AI growth consultant for local businesses. Take a 5-minute audit, get a plan, and let
                2fish do the work, from texting back missed calls to turning your phone clips into a week of
                videos.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href={`/${dir}/audit`} size="lg" variant="inverse">
                  Start your free audit
                  <ArrowRight size={18} aria-hidden="true" />
                </Button>
                <Button href={`/${dir}/dashboard`} size="lg" variant="outline-inverse">
                  See a sample plan
                </Button>
              </div>
              <p className="mt-4 text-sm text-on-navy-muted">Free. No card. About 5 minutes.</p>
            </div>
            <div className="mt-14 min-w-0 translate-y-12 sm:translate-y-16">
              <DashboardPreview chrome="navy" />
            </div>
          </Container>
        </section>
        <div className="h-12 sm:h-16" aria-hidden="true" />

        {/* The loop as a four-up stepper */}
        <section id="how">
          <Container className="py-16 lg:py-24">
            <div className="max-w-2xl">
              <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
                Consultants help McDonald&apos;s. We help you.
              </h2>
              <p className="mt-5 text-lg text-muted">
                Big firms charge big companies to find where money leaks out and fix it. 2fish does the same four
                things for a shop with two trucks. And it does the fixing itself.
              </p>
            </div>
            <ol className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {loop.map((step) => (
                <li key={step.n} className="min-w-0 border-t-2 border-navy pt-5">
                  <p className="num text-sm font-medium text-muted">
                    0{step.n} · {step.name}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold leading-snug tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted">{step.body}</p>
                  <StepSnippet n={step.n} className="mt-5" />
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* Calculator in a sand panel */}
        <section id="cost">
          <Container className="pb-16 lg:pb-24">
            <div className="grid items-start gap-8 rounded-card bg-sand p-5 sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:p-12">
              <div>
                <p className="text-sm font-medium text-muted">The biggest leak</p>
                <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
                  What a missed call costs you.
                </h2>
                <p className="mt-5 max-w-md text-lg text-ink/80">
                  Power washers, landscapers and cleaners miss a lot of calls because they&apos;re working. Most
                  of those callers don&apos;t leave a voicemail. They call the next name on the list.
                </p>
                <p className="mt-4 max-w-md text-ink/80">
                  Move the slider to see what that costs at your prices. 2fish texts back within 10 seconds so the
                  caller waits for you instead.
                </p>
              </div>
              <MissedCallCalculator dir={dir} />
            </div>
          </Container>
        </section>

        {/* What it does + pricing side by side on desktop */}
        <section className="border-t border-line">
          <Container className="grid gap-12 py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-24">
            <div>
              <h2 className="font-display text-3xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-4xl">
                Not advice. The actual work.
              </h2>
              <dl className="mt-8 divide-y divide-line border-y border-line">
                {features.map((f) => (
                  <div key={f.title} className="grid gap-1 py-4 sm:grid-cols-[1fr_auto] sm:gap-6">
                    <div>
                      <dt className="font-medium">{f.title}</dt>
                      <dd className="mt-1 text-sm text-muted">{f.body}</dd>
                    </div>
                    <dd className="text-xs text-muted sm:pt-1 sm:text-right">{f.when}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div id="pricing">
              <h2 className="font-display text-3xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-4xl">
                Free to find the leaks.
              </h2>
              <div className="mt-8 overflow-hidden rounded-card border border-line">
                <div className="p-5">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-medium">Free</h3>
                    <Money amount={0} tone="ink" className="font-display text-2xl font-semibold" />
                  </div>
                  <p className="mt-1 text-sm text-muted">The audit, your ranked plan, monthly updates.</p>
                </div>
                <div className="border-t border-line bg-navy p-5 text-white on-navy">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-medium">Pro</h3>
                    <p>
                      <Money amount={79} tone="white" className="font-display text-2xl font-semibold" />
                      <span className="text-sm text-on-navy-muted"> a month</span>
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-on-navy-muted">
                    Text-back, review requests, weekly videos, reminders.
                  </p>
                  <p className="mt-3 inline-block rounded-full border border-on-navy-line px-2 py-0.5 text-xs text-on-navy-muted">
                    Placeholder price
                  </p>
                  <ul className="mt-4 space-y-1.5 text-sm">
                    {["Everything 2fish does for you", "Cancel any month"].map((x) => (
                      <li key={x} className="flex gap-2">
                        <Check size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                        {x}
                      </li>
                    ))}
                  </ul>
                  <Button href={`/${dir}/audit`} variant="inverse" className="mt-5 w-full">
                    Start with the free audit
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Closing */}
        <section className="border-t border-line bg-surface">
          <Container className="py-16 lg:py-24">
            <h2 className="max-w-2xl font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
              Bring what you have. We&apos;ll multiply it.
            </h2>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={`/${dir}/audit`} size="lg">
                Start your free audit
              </Button>
              <Button href={`/${dir}/dashboard`} size="lg" variant="secondary">
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

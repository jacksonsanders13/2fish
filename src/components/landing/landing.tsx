import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { BrowserWindow } from "@/components/ui/mock-browser-window";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";
import { MissedCallCalculator } from "./calculator";
import { DashboardPreview } from "./dashboard-preview";
import { features, loop, StepSnippet } from "./loop";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

// Landing page, laid out as a funnel: the leak, the plan, the work, then the ask.
// Each step sits on the same grid with its number pinned in the left column.
export function Landing() {
  return (
    <>
      <SiteHeader tone="light" />
      <main className="overflow-x-clip">
        {/* Hero: copy on the left, the product on the right */}
        <section className="border-b border-line">
          <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-12">
            <div className="min-w-0">
              {/* Cult UI's word mode hardcodes its own heading styles, so the wrapper overrides them. */}
              <div
                role="heading"
                aria-level={1}
                aria-label="Find the money your business is losing. Then get it back."
                className="[&>h2]:m-0 [&>h2]:p-0 [&>h2]:text-display [&>h2]:font-display [&>h2]:font-normal [&>h2]:text-ink"
              >
                <TextAnimate text="Find the money your business is losing. Then get it back." type="whipIn" />
              </div>
              <Reveal immediate delay={0.45}>
                <p className="mt-6 max-w-xl">
                  2fish is an AI growth consultant for local businesses. Take a 5-minute audit, get a plan, and let
                  2fish do the work, from texting back missed calls to turning your phone clips into a week of
                  videos.
                </p>
              </Reveal>
              <Reveal immediate delay={0.6} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" variant="signal" className="h-12 px-5 text-base">
                  <Link href="/audit">
                    Start your free audit
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-5 text-base">
                  <Link href="/dashboard">See a sample plan</Link>
                </Button>
              </Reveal>
              <Reveal immediate delay={0.7}>
                <FunnelMap className="mt-10" />
              </Reveal>
            </div>
            <Reveal immediate delay={0.75} y={48} duration={0.9} className="min-w-0">
              <BrowserWindow
                variant="generic"
                headerStyle="minimal"
                theme="light"
                url="app.join2fish.com/dashboard"
                className="h-auto! w-full max-w-none! rounded-md! border-line mask-none! shadow-none!"
              >
                <DashboardPreview chrome="light" />
              </BrowserWindow>
              <p className="mt-2 text-sm text-muted-foreground">Sample business: Oak &amp; Ash Exterior Cleaning, Raleigh.</p>
            </Reveal>
          </Container>
        </section>

        {/* 01 The leak */}
        <Step id="cost" n={1} label="Find the leak">
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
            <div>
              <h2 className="text-display">What a missed call costs you.</h2>
              <p className="mt-5 max-w-md">
                Power washers, landscapers and cleaners miss a lot of calls because they&apos;re working. Most of
                those callers don&apos;t leave a voicemail. They call the next name on the list.
              </p>
              <p className="mt-4 max-w-md">Move the slider to see what that costs at your prices.</p>
              <StepLink href="/audit" className="mt-6">
                Find every leak, not just this one
              </StepLink>
            </div>
            <Reveal delay={0.2} className="rounded-md bg-surface p-5 sm:p-8">
              <MissedCallCalculator />
            </Reveal>
          </div>
        </Step>

        {/* 02 The plan */}
        <Step id="how" n={2} label="Get the plan">
          <div className="max-w-2xl">
            <h2 className="text-display">Consultants help McDonald&apos;s. We help you.</h2>
            <p className="mt-5">
              Big firms charge big companies to find where money leaks out and fix it. 2fish does the same four
              things for small businesses.
            </p>
          </div>
          <ol className="mt-10 grid gap-10 md:grid-cols-2 lg:gap-x-12">
            {loop.map((step, i) => (
              <Reveal as="li" key={step.n} delay={i * 0.1} y={32} className="min-w-0 border-t border-ink pt-4">
                <p className="num text-sm font-semibold text-muted-foreground">
                  {step.n}. {step.name}
                </p>
                <h3 className="mt-1 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm">{step.body}</p>
                <StepSnippet n={step.n as 1 | 2 | 3 | 4} className="mt-5" />
              </Reveal>
            ))}
          </ol>
          <StepLink href="/dashboard" className="mt-10">
            See a sample plan
          </StepLink>
        </Step>

        {/* 03 The work, and what it costs */}
        <Step id="pricing" n={3} label="Let 2fish do it">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div>
              <h2 className="text-display">Not advice. The actual work.</h2>
              <dl className="mt-8 divide-y divide-line border-y border-line">
                {features.map((f, i) => (
                  <Reveal key={f.title} delay={i * 0.08} y={16} className="grid gap-1 py-4 sm:grid-cols-[1fr_auto] sm:gap-6">
                    <div>
                      <dt className="font-semibold">{f.title}</dt>
                      <dd className="mt-1 text-sm">{f.body}</dd>
                    </div>
                    <dd className="text-sm text-muted-foreground sm:pt-1 sm:text-right">{f.when}</dd>
                  </Reveal>
                ))}
              </dl>
            </div>
            <Reveal delay={0.15} y={32} className="self-start">
              <div className="rounded-md border border-line">
                <div className="p-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-semibold">Free</h3>
                    <span className="num font-semibold">$0</span>
                  </div>
                  <p className="mt-1 text-sm">The audit, your ranked plan, and chat with your consultant.</p>
                </div>
                <div className="border-t border-line bg-surface p-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-semibold">Pro</h3>
                    <span className="num font-semibold">$79 a month</span>
                  </div>
                  <p className="mt-1 text-sm">Text-back, review requests, weekly videos, reminders.</p>
                  <p className="mt-3 inline-block rounded-full border border-line bg-white px-2.5 py-0.5 text-sm text-muted-foreground">
                    Placeholder price
                  </p>
                  <ul className="mt-4 space-y-1.5 text-sm">
                    {["Everything 2fish does for you", "Cancel any month"].map((x) => (
                      <li key={x} className="flex gap-2">
                        <Check size={16} className="mt-0.5 shrink-0 text-cash" aria-hidden="true" />
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </Step>

        {/* The ask, on the one dark band */}
        <section className="on-night bg-night text-white">
          <Container className="grid gap-8 py-16 lg:grid-cols-[1fr_auto] lg:items-end lg:py-24">
            <Reveal y={32}>
              <h2 className="max-w-2xl text-display text-white">Bring what you have. We&apos;ll multiply it.</h2>
            </Reveal>
            <Reveal delay={0.15} y={16}>
              <Button asChild size="lg" variant="signal" className="h-12 w-full px-5 text-base sm:w-auto">
                <Link href="/audit">
                  Start your free audit
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </Reveal>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

const steps = ["Find the leak", "Get the plan", "Let 2fish do it"];

// The three steps as a small map under the hero buttons. Each one jumps to its section.
function FunnelMap({ className }: { className?: string }) {
  const ids = ["cost", "how", "pricing"];
  return (
    <ol className={cn("grid grid-cols-3 border-t border-line text-sm", className)}>
      {steps.map((s, i) => (
        <li key={s} className="min-w-0">
          <a href={`#${ids[i]}`} className="block py-3 pr-2 hover:underline">
            <span className="num block font-semibold">0{i + 1}</span>
            <span className="block text-muted-foreground">{s}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

// One funnel step. The number and label stay pinned in the left column on wide screens.
function Step({ id, n, label, children }: { id: string; n: number; label: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-line">
      <Container className="grid gap-6 py-16 lg:grid-cols-[180px_1fr] lg:gap-12 lg:py-24">
        <div>
          <div className="lg:sticky lg:top-24">
            <p className="num text-display leading-none">0{n}</p>
            <p className="mt-2 text-sm font-semibold">{label}</p>
          </div>
        </div>
        <Reveal y={32} className="min-w-0">
          {children}
        </Reveal>
      </Container>
    </section>
  );
}

// Small call to action at the end of each step.
function StepLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 font-semibold underline decoration-line decoration-2 underline-offset-4 hover:decoration-ink",
        className,
      )}
    >
      {children}
      <ArrowRight size={16} aria-hidden="true" />
    </Link>
  );
}

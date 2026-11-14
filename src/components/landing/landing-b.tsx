import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { MissedCallCalculator } from "./calculator";
import { DashboardPreview } from "./dashboard-preview";
import { features, loop, StepSnippet } from "./loop";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import type { Dir } from "@/lib/format";

// Direction B, "Harbor". Navy hero, Bricolage Grotesque.
export function LandingB({ dir }: { dir: Dir }) {
  return (
    <>
      <SiteHeader dir={dir} tone="navy" />
      <main>
        {/* Hero on navy, dashboard shot hanging over the edge */}
        <section className="on-navy bg-navy text-white">
          <Container className="pt-14 sm:pt-20">
            <div className="max-w-3xl">
              <Reveal immediate>
                <h1 className="text-display font-bold">Find the money your business is losing. Then get it back.</h1>
              </Reveal>
              <Reveal immediate delay={0.08}>
                <p className="mt-6 max-w-xl text-on-navy-muted">
                  2fish is an AI growth consultant for local businesses. Take a 5-minute audit, get a plan, and let
                  2fish do the work, from texting back missed calls to turning your phone clips into a week of
                  videos.
                </p>
              </Reveal>
              <Reveal immediate delay={0.16} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 bg-white px-5 text-base text-navy hover:bg-surface">
                  <Link href={`/${dir}/audit`}>
                    Start your free audit
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 border-white/40 bg-transparent px-5 text-base text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href={`/${dir}/dashboard`}>See a sample plan</Link>
                </Button>
              </Reveal>
            </div>
            <Reveal immediate delay={0.28} y={24} className="mt-14 min-w-0 translate-y-12 sm:translate-y-16">
              <DashboardPreview chrome="navy" />
            </Reveal>
          </Container>
        </section>
        <div className="h-12 sm:h-16" aria-hidden="true" />

        {/* The loop as a four-up stepper */}
        <section id="how">
          <Container className="py-16 lg:py-24">
            <Reveal className="max-w-2xl">
              <h2 className="text-display font-bold">Consultants help McDonald&apos;s. We help you.</h2>
              <p className="mt-5">
                Big firms charge big companies to find where money leaks out and fix it. 2fish does the same four
                things for small businesses.
              </p>
            </Reveal>
            <ol className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {loop.map((step, i) => (
                <Reveal as="li" key={step.n} delay={i * 0.08} className="min-w-0 border-t-2 border-navy pt-5">
                  <p className="num text-sm font-semibold">
                    0{step.n} · {step.name}
                  </p>
                  <h3 className="mt-2 font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm">{step.body}</p>
                  <StepSnippet n={step.n} className="mt-5" />
                </Reveal>
              ))}
            </ol>
          </Container>
        </section>

        {/* Calculator in a surface panel */}
        <section id="cost">
          <Container className="pb-16 lg:pb-24">
            <Reveal className="grid items-start gap-8 rounded-lg bg-surface p-5 sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:p-12">
              <div>
                <p className="text-sm font-semibold">The biggest leak</p>
                <h2 className="mt-3 text-display font-bold">What a missed call costs you.</h2>
                <p className="mt-5 max-w-md">
                  Power washers, landscapers and cleaners miss a lot of calls because they&apos;re working. Most
                  of those callers don&apos;t leave a voicemail. They call the next name on the list.
                </p>
                <p className="mt-4 max-w-md">
                  Move the slider to see what that costs at your prices. 2fish texts back within 10 seconds so the
                  caller waits for you instead.
                </p>
              </div>
              <MissedCallCalculator dir={dir} />
            </Reveal>
          </Container>
        </section>

        {/* What it does + pricing side by side on desktop */}
        <section className="border-t border-line">
          <Container className="grid gap-12 py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-24">
            <Reveal>
              <h2 className="text-display font-bold">Not advice. The actual work.</h2>
              <dl className="mt-8 divide-y divide-line border-y border-line">
                {features.map((f) => (
                  <div key={f.title} className="grid gap-1 py-4 sm:grid-cols-[1fr_auto] sm:gap-6">
                    <div>
                      <dt className="font-bold">{f.title}</dt>
                      <dd className="mt-1 text-sm">{f.body}</dd>
                    </div>
                    <dd className="text-sm text-muted-foreground sm:pt-1 sm:text-right">{f.when}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal delay={0.1}>
              <div id="pricing">
                <h2 className="text-display font-bold">Free to find the leaks.</h2>
                <div className="mt-8 overflow-hidden rounded-lg border border-line">
                  <div className="p-5">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-bold">Free</h3>
                      <span className="num font-bold">$0</span>
                    </div>
                    <p className="mt-1 text-sm">The audit, your ranked plan, monthly updates.</p>
                  </div>
                  <div className="on-navy border-t border-line bg-navy p-5 text-white">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-bold">Pro</h3>
                      <span className="num font-bold">$79 a month</span>
                    </div>
                    <p className="mt-1 text-sm text-on-navy-muted">
                      Text-back, review requests, weekly videos, reminders.
                    </p>
                    <p className="mt-3 inline-block rounded-full border border-on-navy-line px-2.5 py-0.5 text-sm text-on-navy-muted">
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
                    <Button asChild className="mt-5 w-full bg-white text-navy hover:bg-surface">
                      <Link href={`/${dir}/audit`}>Start with the free audit</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* Closing */}
        <section className="border-t border-line bg-surface">
          <Container className="py-16 lg:py-24">
            <Reveal>
              <h2 className="max-w-2xl text-display font-bold">Bring what you have. We&apos;ll multiply it.</h2>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-5 text-base">
                  <Link href={`/${dir}/audit`}>Start your free audit</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 bg-white px-5 text-base">
                  <Link href={`/${dir}/dashboard`}>See a sample plan</Link>
                </Button>
              </div>
            </Reveal>
          </Container>
        </section>
      </main>
      <SiteFooter dir={dir} />
    </>
  );
}

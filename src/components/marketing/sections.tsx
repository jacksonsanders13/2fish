import Link from "next/link";
import {
  ArrowRightIcon,
  BellIcon,
  EyeOffIcon,
  GiftIcon,
  HandHeartIcon,
  MapPinIcon,
  MessageSquareIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { LogoMark } from "@/components/brand/logo";
import { FeedPreview } from "./feed-preview";
import { cn } from "@/lib/utils";

/* ---------- Hero ---------- */

export function Hero() {
  return (
    <section className="grain relative overflow-hidden">
      <div className="glow-amber pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
      <div className="bg-grid mask-fade-b pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-40" />
      <Container className="relative pt-20 pb-10 sm:pt-28 md:pt-32">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur">
            <span className="size-1.5 rounded-full bg-brand" />
            Now welcoming neighbors in Raleigh, NC
          </p>
          <h1 className="text-display mt-6 text-4xl font-semibold sm:text-6xl md:text-7xl">
            Neighbors helping neighbors, one specific need at a time.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Post exactly what you need, like size 4 diapers or a winter coat. Someone nearby drops it off at a
            public spot or buys it from your wishlist. No fundraisers, no fees, no addresses.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-11 w-full px-5 text-[15px] sm:w-auto" render={<Link href="/needs/new" />}>
              Post a need
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 w-full px-5 text-[15px] sm:w-auto"
              render={<Link href="/needs" />}
            >
              Give nearby
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Free to use. Browse without an account.</p>
        </Reveal>

        <Reveal delay={0.15} y={28} className="relative mx-auto mt-14 max-w-4xl sm:mt-20">
          <div className="pointer-events-none absolute -inset-x-10 -top-10 h-40 rounded-full bg-brand/15 blur-3xl" />
          <FeedPreview />
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------- Principles strip ---------- */

const PRINCIPLES = [
  { icon: EyeOffIcon, text: "No addresses, ever" },
  { icon: GiftIcon, text: "Free for everyone" },
  { icon: ShieldCheckIcon, text: "Meet in public places" },
  { icon: HandHeartIcon, text: "One helper per need" },
];

export function PrinciplesStrip() {
  return (
    <section className="border-y bg-card/50">
      <Container className="grid grid-cols-2 divide-border md:grid-cols-4 md:divide-x">
        {PRINCIPLES.map((p) => (
          <div key={p.text} className="flex items-center justify-center gap-2.5 py-5 text-sm font-medium">
            <p.icon className="size-4 text-brand-text" />
            {p.text}
          </div>
        ))}
      </Container>
    </section>
  );
}

/* ---------- Bento features ---------- */

const FEATURES = [
  {
    icon: SparklesIcon,
    title: "Specific, not vague",
    body: "No campaigns or goals. Just the one thing a family needs this week, said plainly, so a neighbor can say yes.",
    span: "md:col-span-2",
    art: <SpecificArt />,
  },
  {
    icon: GiftIcon,
    title: "Two ways to give",
    body: "Hand it off at a library or church lobby, or buy it from the poster's wishlist and let the store ship it.",
    art: <WaysArt />,
  },
  {
    icon: MapPinIcon,
    title: "Nearby first",
    body: "Needs show up by distance from your ZIP, within a radius you choose. Distances are approximate on purpose.",
    art: <RadiusArt />,
  },
  {
    icon: EyeOffIcon,
    title: "Private by design",
    body: "We never store exact addresses. Posts show a rounded location and “~2 mi away”. Handoff details stay in private messages.",
    span: "md:col-span-2",
    art: <PrivacyArt />,
  },
  {
    icon: MessageSquareIcon,
    title: "Coordinate in messages",
    body: "One thread per need, realtime, with safety tips a tap away.",
  },
  {
    icon: BellIcon,
    title: "Know the moment",
    body: "Get notified when a neighbor offers help or a message lands.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Report and block",
    body: "Every post, person and message can be reported. Blocks are instant.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-display text-3xl font-semibold sm:text-5xl">Built for real neighborhoods</h2>
          <p className="mt-4 text-muted-foreground sm:text-lg">
            Everything it takes to ask for help without feeling exposed, and to give without the guesswork.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={Math.min(i * 0.05, 0.3)} className={cn("h-full", f.span)}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-6 shadow-soft transition-shadow hover:shadow-lift">
                {f.art && <div className="mb-5 -mx-6 -mt-6 border-b bg-muted/40">{f.art}</div>}
                <div className="flex size-9 items-center justify-center rounded-lg border bg-background text-brand-text">
                  <f.icon className="size-4" />
                </div>
                <h3 className="text-title mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function SpecificArt() {
  return (
    <div className="flex h-36 items-center gap-4 px-6 py-5">
      <div className="flex-1 space-y-2 opacity-50">
        <div className="h-2.5 w-2/3 rounded bg-foreground/15" />
        <div className="h-2 w-1/2 rounded bg-foreground/10" />
        <div className="h-2 w-5/6 rounded bg-foreground/10" />
        <div className="mt-3 h-6 w-28 rounded-full bg-foreground/10" />
      </div>
      <div className="w-[58%] rounded-xl border bg-background p-3 shadow-soft">
        <p className="text-[11px] font-medium text-muted-foreground">What do you need?</p>
        <p className="mt-1 text-sm font-semibold">Size 4 diapers, 2 boxes</p>
        <div className="mt-2 flex gap-1.5">
          {["Baby", "This week", "Drop-off"].map((t) => (
            <span key={t} className="rounded-full border bg-card px-2 py-0.5 text-[10px] font-medium">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function WaysArt() {
  return (
    <div className="grid h-36 grid-cols-2 gap-3 px-6 py-5">
      <div className="flex flex-col items-center justify-center rounded-xl border bg-background text-center">
        <MapPinIcon className="size-5 text-brand-text" />
        <p className="mt-2 text-xs font-semibold">Drop-off</p>
        <p className="text-[10px] text-muted-foreground">public spot</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border bg-background text-center">
        <GiftIcon className="size-5 text-brand-text" />
        <p className="mt-2 text-xs font-semibold">Wishlist</p>
        <p className="text-[10px] text-muted-foreground">store ships it</p>
      </div>
    </div>
  );
}

function RadiusArt() {
  return (
    <div className="relative flex h-36 items-center justify-center overflow-hidden">
      {[120, 84, 48].map((d, i) => (
        <span
          key={d}
          className="absolute rounded-full border border-brand/40"
          style={{ width: d, height: d, opacity: 0.35 + i * 0.25 }}
        />
      ))}
      <span className="absolute size-2.5 rounded-full bg-brand ring-4 ring-brand/20" />
      {[
        [-34, -18],
        [28, -30],
        [40, 22],
        [-20, 30],
      ].map(([x, y]) => (
        <span
          key={`${x}${y}`}
          className="absolute size-2 rounded-full bg-foreground/60"
          style={{ transform: `translate(${x}px, ${y}px)` }}
        />
      ))}
      <span className="absolute bottom-3 rounded-full border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        within 10 mi
      </span>
    </div>
  );
}

function PrivacyArt() {
  return (
    <div className="flex h-36 items-center justify-center gap-3 px-6 py-5 text-xs">
      <div className="rounded-xl border bg-background px-3 py-2 text-muted-foreground line-through decoration-destructive/70">
        412 Maple St, Apt 3
      </div>
      <ArrowRightIcon className="size-4 text-muted-foreground" />
      <div className="rounded-xl border border-brand/40 bg-brand-soft px-3 py-2 font-medium text-brand-text">
        ~2 mi away · North Raleigh
      </div>
    </div>
  );
}

/* ---------- How it works ---------- */

const STEPS = [
  {
    n: "01",
    title: "Post the need",
    body: "Say what it is, how soon, and how you'd like to receive it. Add a wishlist link if you have one. Takes about a minute.",
  },
  {
    n: "02",
    title: "A neighbor says “I can help”",
    body: "You get a notification and a private message thread. Agree on a public meeting spot, or they order from your wishlist.",
  },
  {
    n: "03",
    title: "Mark it fulfilled",
    body: "Once it's in your hands, tap fulfilled. Your helper gets a thank-you, and the post comes off the board.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-t bg-card/40 py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <Reveal>
            <h2 className="text-display text-3xl font-semibold sm:text-5xl">How it works</h2>
            <p className="mt-4 text-muted-foreground sm:text-lg">
              Three steps, start to finish. No campaigns to run, no money changing hands on the site.
            </p>
            <Button className="mt-6" variant="outline" render={<Link href="/safety" />}>
              Read our safety tips
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </Reveal>
          <ol className="relative space-y-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <li className="flex gap-5 rounded-2xl border bg-card p-5 shadow-soft sm:p-6">
                  <span className="font-mono text-sm font-medium text-brand-text">{s.n}</span>
                  <div>
                    <h3 className="text-title text-lg font-semibold">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

/* ---------- Origin ---------- */

export function Origin() {
  return (
    <section className="py-20 sm:py-28">
      <Container size="md">
        <Reveal className="relative overflow-hidden rounded-3xl border bg-card px-6 py-12 text-center shadow-soft sm:px-12 sm:py-16">
          <div className="glow-amber pointer-events-none absolute inset-x-0 top-0 h-full" />
          <LogoMark size={44} className="relative mx-auto text-brand" />
          <h2 className="text-display relative mt-6 text-3xl font-semibold sm:text-4xl">A little is enough.</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground sm:text-lg">
            The name comes from an old story: a boy offered two fish and a few loaves, and somehow a whole crowd
            ate. We think most neighborhoods work the same way. Nobody has to give a lot. Everyone has to give a
            little.
          </p>
          <Button className="relative mt-6" variant="ghost" render={<Link href="/about" />}>
            Our story
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------- FAQ ---------- */

const FAQ = [
  {
    q: "Is 2fish free?",
    a: "Yes, completely. There are no fees for posting or giving, and no money moves through the site. Neighbors either hand items off in person or buy from a wishlist directly at the store.",
  },
  {
    q: "Do I need an account to browse?",
    a: "No. Anyone can browse open needs. You only need an account to post a need, offer help, or send messages.",
  },
  {
    q: "How do you keep my location private?",
    a: "We ask for your ZIP code and convert it to an approximate center point, rounded to about a kilometer. That's all we store. Other people see something like “~2 mi away”. Exact meeting spots are only shared in private messages, by you, if you choose to.",
  },
  {
    q: "What can I ask for?",
    a: "Specific physical items: diapers, groceries, a coat, school supplies, a shower chair. 2fish isn't for cash, rent, or fundraising. Keep it to one need per post so a neighbor can say yes to the whole thing.",
  },
  {
    q: "How do handoffs work safely?",
    a: "Always meet in a public, well-lit place like a library, grocery store, or church lobby, during the day if you can. Never share your home address. Our safety page has the full list, and it's linked right inside every message thread.",
  },
  {
    q: "What if something feels wrong?",
    a: "Every post, person, and message has a report button, and you can block anyone instantly. Reports go to a human who reviews them. If anyone is in danger, call 911 first.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t py-20 sm:py-28">
      <Container size="md">
        <Reveal>
          <h2 className="text-display text-3xl font-semibold sm:text-5xl">Questions, answered</h2>
        </Reveal>
        <Reveal delay={0.05} className="mt-8">
          <Accordion className="rounded-2xl border bg-card px-5 shadow-soft">
            {FAQ.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="py-4 text-[15px] hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------- Final CTA ---------- */

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t">
      <div className="glow-amber pointer-events-none absolute inset-x-0 bottom-0 h-full rotate-180" />
      <Container className="relative py-20 text-center sm:py-28">
        <Reveal>
          <h2 className="text-display text-3xl font-semibold sm:text-5xl">Ready to help, or need a hand?</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground sm:text-lg">
            Either way, start here. It's the same door.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-11 w-full px-5 text-[15px] sm:w-auto" render={<Link href="/needs/new" />}>
              Post a need
            </Button>
            <Button size="lg" variant="outline" className="h-11 w-full px-5 text-[15px] sm:w-auto" render={<Link href="/needs" />}>
              Browse needs nearby
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

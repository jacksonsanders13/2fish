import type { Metadata } from "next";
import { ExternalLink, Gift, HeartHandshake, MapPin } from "lucide-react";
import Logo, { Wordmark } from "@/components/Logo";
import { CATEGORY_META, CategoryTag } from "@/components/category";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, choiceVariants } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { Skeleton } from "@/components/ui/skeleton";
import { Heading, Text } from "@/components/ui/typography";
import { CATEGORIES } from "@/lib/categories";

// A living reference for the design system. Not linked from the app;
// visit /styleguide. If something here looks off, the tokens are off.

export const metadata: Metadata = { title: "Style guide · 2fish", robots: { index: false } };

const SWATCHES = [
  ["background", "bg-background"],
  ["surface", "bg-surface"],
  ["muted", "bg-muted"],
  ["border", "bg-border"],
  ["foreground", "bg-foreground"],
  ["muted-foreground", "bg-muted-foreground"],
  ["primary", "bg-primary"],
  ["primary-soft", "bg-primary-soft"],
  ["accent", "bg-accent"],
  ["accent-soft", "bg-accent-soft"],
  ["success", "bg-success"],
  ["success-soft", "bg-success-soft"],
  ["destructive", "bg-destructive"],
  ["destructive-soft", "bg-destructive-soft"],
] as const;

const BUTTONS = ["primary", "secondary", "outline", "ghost", "destructive", "dev"] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-b border-border px-4 py-6">
      <CardTitle>{title}</CardTitle>
      {children}
    </section>
  );
}

export default function StyleGuide() {
  return (
    <>
      <div className="grid gap-2 border-b border-border px-4 py-6">
        <Wordmark size={40} />
        <Heading as="h1" level="hero">
          Style guide
        </Heading>
        <Text variant="lead" tone="muted">
          Every token and component variant in one place. Reasoning and rules are in <code>docs/design-system.md</code>.
        </Text>
      </div>

      <Section title="Color tokens">
        <ul className="m-0 grid list-none grid-cols-3 gap-3 p-0 sm:grid-cols-4">
          {SWATCHES.map(([name, cls]) => (
            <li key={name} className="grid gap-1">
              <span className={`h-12 rounded-md border border-border ${cls}`} />
              <code className="text-[11px]">--{name}</code>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Categories">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {CATEGORIES.map((c) => (
            <CategoryTag key={c} category={c} />
          ))}
        </div>
        <div className="flex gap-3">
          {CATEGORIES.slice(0, 4).map((c) => {
            const { icon: Icon, text } = CATEGORY_META[c];
            return (
              <span key={c} className={`grid size-14 place-items-center rounded-full bg-muted ${text}`}>
                <Icon aria-hidden="true" className="size-6" />
              </span>
            );
          })}
        </div>
      </Section>

      <Section title="Typography">
        <div className="grid gap-2">
          <Text variant="eyebrow" tone="muted">eyebrow</Text>
          <Heading as="p" level="hero">A little is enough.</Heading>
          <Heading as="p" level="page">Page heading</Heading>
          <Heading as="p" level="section">Section heading</Heading>
          <Heading as="p" level="card">Post title</Heading>
          <Text variant="lead">Lead: an intro paragraph.</Text>
          <Text>Body: plain, warm, short sentences.</Text>
          <Text variant="meta">Meta · North Raleigh · 3h</Text>
          <Text variant="micro">Micro label</Text>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap gap-2">
          {BUTTONS.map((v) => (
            <Button key={v} variant={v}>
              {v}
            </Button>
          ))}
          <Button variant="primary" disabled>
            disabled
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm">
            <HeartHandshake aria-hidden="true" />
            I&apos;ll help
          </Button>
          <Button variant="primary">medium</Button>
          <Button variant="primary" size="lg">large</Button>
          <Button variant="ghost" size="sm">
            View wishlist
            <ExternalLink aria-hidden="true" />
          </Button>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="open">Open</Badge>
          <Badge variant="pledged">Being helped</Badge>
          <Badge variant="done">Received</Badge>
          <Badge variant="example">Example</Badge>
          <Badge variant="due">By Fri, Nov 14</Badge>
          <Badge variant="urgent">Needed today</Badge>
          <Badge variant="tag" size="md">
            <MapPin aria-hidden="true" />
            Library lobby
          </Badge>
          <Badge variant="tag" size="md">
            <Gift aria-hidden="true" />
            Wishlist
          </Badge>
        </div>
      </Section>

      <Section title="Form controls">
        <Field label="Text input" id="sg-1" hint="Hints sit under the field.">
          <Input id="sg-1" placeholder="Size 4 diapers" />
        </Field>
        <Field label="Invalid input" id="sg-2">
          <Input id="sg-2" aria-invalid defaultValue="123 Oak St" />
        </Field>
        <Field label="Select" id="sg-3">
          <Select id="sg-3" defaultValue="Food">
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <label className={choiceVariants({ variant: "card" })}>
          <input type="radio" name="sg" defaultChecked className="mt-1 size-4 accent-primary" />
          <span>
            <span className="block font-bold">I&apos;ll drop it off</span>
            <span className="block text-sm text-muted-foreground">At North Regional Library lobby</span>
          </span>
        </label>
      </Section>

      <Section title="Notices and cards">
        <Notice variant="info">Info: neutral guidance.</Notice>
        <Notice variant="warning">Warning: things to be aware of.</Notice>
        <Notice variant="success">Success: good news.</Notice>
        <Notice variant="danger">Danger: something needs fixing.</Notice>
        <Card variant="flat" padding="sm">
          <Text>Flat card: sidebar widgets.</Text>
        </Card>
      </Section>

      <Section title="Avatars, logo, loading">
        <div className="flex flex-wrap items-center gap-2">
          <Avatar name="You" tone="brand" />
          {["Jess", "Marcus", "Ana", "Lee", "Sam", "Rio"].map((n) => (
            <Avatar key={n} name={n} seed={n} />
          ))}
          <Avatar name="Big" size="lg" seed="x" />
          <Avatar name="Small" size="sm" seed="y" />
          <Logo size={48} />
          <Logo size={48} tone="muted" />
        </div>
        <div className="grid gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
        </div>
      </Section>
    </>
  );
}

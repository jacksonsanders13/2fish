import type { Metadata } from "next";
import Logo from "@/components/Logo";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Field, Input, Select, choiceVariants } from "@/components/ui/input";
import { Notice } from "@/components/ui/notice";
import { StatusProgress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES, CATEGORY_TONE } from "@/lib/categories";

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

const BUTTONS = ["primary", "help", "hero", "secondary", "outline", "ghost", "destructive", "dev"] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card as="section" padding="md" className="grid gap-4">
      <CardTitle>{title}</CardTitle>
      {children}
    </Card>
  );
}

export default function StyleGuide() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="m-0 text-4xl font-black tracking-tight md:text-6xl">Style guide</h1>
        <p className="m-0 max-w-prose text-muted-foreground md:text-lg">
          Every token and component variant in one place. Reasoning and rules are in <code>docs/design-system.md</code>.
        </p>
      </div>

      <Section title="Color tokens">
        <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-4 lg:grid-cols-7">
          {SWATCHES.map(([name, cls]) => (
            <li key={name} className="grid gap-2">
              <span className={`h-16 rounded-md border border-border ${cls}`} />
              <code className="text-xs">--{name}</code>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Category bands">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <div key={c} className={`flex items-center gap-2 rounded-md px-4 py-3 font-extrabold text-on-color ${CATEGORY_TONE[c]}`}>
              <Logo size={28} tone="inherit" />
              <span className="text-sm uppercase tracking-widest">{c}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="grid gap-2">
          <p className="m-0 text-4xl font-black leading-none tracking-tight md:text-6xl">Hero · A little is enough.</p>
          <p className="m-0 text-3xl font-black tracking-tight md:text-4xl">Page heading</p>
          <p className="m-0 text-xl font-black md:text-2xl">Section heading</p>
          <p className="m-0 text-lg font-black md:text-xl">Card title</p>
          <p className="m-0">Body text. Plain, warm, short sentences.</p>
          <p className="m-0 text-sm text-muted-foreground">Meta text · North Raleigh · 3h</p>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap gap-2">
          {BUTTONS.map((v) => (
            <Button key={v} variant={v}>
              {v}
            </Button>
          ))}
          <Button variant="help" disabled>
            disabled
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="help" size="sm">small</Button>
          <Button variant="help" size="md">medium</Button>
          <Button variant="help" size="lg">large</Button>
        </div>
        <Card variant="hero" padding="md" className="flex flex-wrap gap-2">
          <Button variant="inverse">inverse</Button>
          <Button variant="onPrimary">onPrimary</Button>
        </Card>
      </Section>

      <Section title="Badges and chips">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="open">Open</Badge>
          <Badge variant="pledged">Being helped</Badge>
          <Badge variant="done">Received</Badge>
          <Badge variant="example">Example</Badge>
          <Badge size="md">Drop off: Library</Badge>
          <span className="rounded-md bg-cat-food px-2 py-2">
            <Badge variant="urgent" size="md">Needed today</Badge>
          </span>
          <span className="rounded-md bg-cat-baby px-2 py-2">
            <Badge variant="due" size="md">By Fri, Nov 14</Badge>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip selected>Selected</Chip>
          <Chip selected={false}>Not selected</Chip>
        </div>
      </Section>

      <Section title="Form controls">
        <div className="grid gap-4 sm:grid-cols-2">
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
          <div className="grid gap-2">
            <label className={choiceVariants({ variant: "card" })}>
              <input type="radio" name="sg" defaultChecked className="mt-1 size-4 accent-success" />
              <span>
                <span className="block font-bold">I&apos;ll drop it off</span>
                <span className="block text-sm text-muted-foreground">At North Regional Library lobby</span>
              </span>
            </label>
          </div>
        </div>
      </Section>

      <Section title="Notices">
        <Notice variant="info">Info: safety tips and neutral guidance.</Notice>
        <Notice variant="warning">Warning: preview mode and things to be aware of.</Notice>
        <Notice variant="success">Success: a helper&apos;s note.</Notice>
        <Notice variant="danger">Danger: something needs fixing before you can post.</Notice>
      </Section>

      <Section title="Progress, avatars, loading">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatusProgress status="open" />
          <StatusProgress status="pledged" />
          <StatusProgress status="done" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Avatar name="You" tone="brand" />
          {["Jess", "Marcus", "Ana", "Lee", "Sam", "Rio"].map((n) => (
            <Avatar key={n} name={n} seed={n} />
          ))}
          <Avatar name="Big" size="lg" seed="x" />
          <Avatar name="Small" size="sm" seed="y" />
        </div>
        <div className="grid gap-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </div>
      </Section>
    </div>
  );
}

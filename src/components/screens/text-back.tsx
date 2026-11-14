import { CircleCheck, PhoneMissed, ShieldCheck } from "lucide-react";
import { AppShell, PageBody } from "@/components/app/shell";
import { Money } from "@/components/ui/money";
import { conversation, textBackSetup } from "@/lib/data";
import { cn, type Dir } from "@/lib/utils";
import { Toggle } from "./toggle";

export function TextBackScreen({ dir }: { dir: Dir }) {
  return (
    <AppShell dir={dir} active="text-back">
      <PageBody>
        <header className="max-w-2xl">
          <p className="text-sm text-muted">Plan · Step 1</p>
          <h1 className="mt-1 font-display text-3xl tracking-tight sm:text-4xl">Text back every missed call</h1>
          <p className="mt-3 text-muted">
            When you can&apos;t pick up, the caller gets a text in 10 seconds. You see the reply here and on your
            phone, and 2fish drafts answers for you to approve.
          </p>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_400px]">
          <section className="rounded-card border border-line bg-white" aria-labelledby="setup">
            <div className="flex items-center justify-between gap-4 border-b border-line p-5">
              <div>
                <h2 id="setup" className="font-medium">
                  Setup
                </h2>
                <p className="text-sm text-muted">Live since Nov 3</p>
              </div>
              <Toggle label="Text-back on" defaultOn />
            </div>
            <dl className="divide-y divide-line">
              <Row label="Business line" value={textBackSetup.line}>
                Missed calls forward here from your existing number. Nothing changes for callers.
              </Row>
              <Row label="Text goes out after" value={textBackSetup.delay} />
              <Row label="Texting hours" value={textBackSetup.hours}>
                Calls missed outside these hours get a text at 8 the next morning.
              </Row>
              <div className="p-5">
                <dt className="text-sm text-muted">First message</dt>
                <dd className="mt-2">
                  <textarea
                    readOnly
                    rows={4}
                    defaultValue={textBackSetup.template}
                    aria-label="First message"
                    className="w-full resize-none rounded-ctl border border-line bg-surface p-3 text-sm"
                  />
                </dd>
                <dd className="mt-2 text-xs text-muted">Replies to STOP and HELP are handled automatically.</dd>
              </div>
            </dl>
            <p className="flex gap-2 border-t border-line p-5 text-sm text-muted">
              <ShieldCheck size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              Only people who called you get a text. No lists, no cold outreach.
            </p>
          </section>

          <aside>
            <h2 className="font-medium">A conversation from Tuesday</h2>
            <p className="text-sm text-muted">(919) 555-0142</p>
            <ol className="mt-3 space-y-3 rounded-card border border-line bg-white p-4">
              {conversation.map((m, i) => (
                <Bubble key={i} {...m} />
              ))}
            </ol>
          </aside>
        </div>
      </PageBody>
    </AppShell>
  );
}

function Row({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="grid gap-1 p-5 sm:grid-cols-[180px_1fr] sm:gap-6">
      <dt className="text-sm text-muted">{label}</dt>
      <dd>
        <p className="num font-medium">{value}</p>
        {children ? <p className="mt-1 text-sm text-muted">{children}</p> : null}
      </dd>
    </div>
  );
}

function Bubble({ from, text, time }: { from: string; text: string; time?: string }) {
  if (from === "system") {
    const booked = text.startsWith("Booked");
    return (
      <li className="flex items-center justify-center gap-1.5 py-1 text-xs text-muted">
        {booked ? <CircleCheck size={14} aria-hidden="true" /> : <PhoneMissed size={14} aria-hidden="true" />}
        {booked ? (
          <span>
            Booked. Driveway and patio, est. <Money amount={450} className="font-medium" />
          </span>
        ) : (
          <span>{text}</span>
        )}
        {time ? <span className="num">· {time}</span> : null}
      </li>
    );
  }
  if (from === "owner-note") {
    return (
      <li className="rounded-ctl bg-sand px-3 py-2 text-xs text-navy">
        {text}
      </li>
    );
  }
  const mine = from === "business";
  return (
    <li className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[85%]", mine ? "text-right" : "text-left")}>
        <p
          className={cn(
            "inline-block rounded-card px-3.5 py-2.5 text-left text-sm leading-relaxed",
            mine ? "bg-navy text-white" : "bg-surface text-ink",
          )}
        >
          {text}
        </p>
        {time ? <p className="num mt-1 text-[11px] text-muted">{time}</p> : null}
      </div>
    </li>
  );
}

import { CircleCheck, PhoneMissed, ShieldCheck } from "lucide-react";
import { AppShell, PageBody } from "@/components/app/shell";
import { Reveal } from "@/components/motion/reveal";
import { Money } from "@/components/ui/money";
import { SpeechBubbleBody, SpeechBubbleRoot, SpeechBubbleTail } from "@/components/ui/speech-bubble";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { conversation, textBackSetup } from "@/lib/data";
import { cn } from "@/lib/utils";

// Preview of the missed-call text-back step. The real version ships in Phase 4
// with Twilio behind it; this shows the owner what they're turning on.
export function TextBackScreen() {
  return (
    <AppShell active="text-back">
      <PageBody>
        <Reveal immediate y={16}>
          <header className="max-w-2xl">
            <p className="text-sm text-muted-foreground">Plan · Preview</p>
            <h1 className="mt-1 text-display font-semibold">Text back every missed call</h1>
            <p className="mt-3">
              When you can&apos;t pick up, the caller gets a text in 10 seconds. You see the reply here and on your
              phone, and 2fish drafts answers for you to approve. This step turns on in the next release.
            </p>
          </header>
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_400px]">
          <Reveal immediate delay={0.12}>
            <section className="rounded-lg border border-line bg-white" aria-labelledby="setup">
              <div className="flex items-center justify-between gap-4 border-b border-line p-5">
                <div>
                  <h2 id="setup" className="font-semibold">
                    Setup
                  </h2>
                  <p className="text-sm text-muted-foreground">Sample settings</p>
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <Switch defaultChecked aria-label="Text-back on" />
                  On
                </label>
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
                  <dt className="text-sm text-muted-foreground">First message</dt>
                  <dd className="mt-2">
                    <Textarea
                      readOnly
                      rows={4}
                      defaultValue={textBackSetup.template}
                      aria-label="First message"
                      className="resize-none bg-surface p-3 text-sm"
                    />
                  </dd>
                  <dd className="mt-2 text-sm text-muted-foreground">Replies to STOP and HELP are handled automatically.</dd>
                </div>
              </dl>
              <p className="flex gap-2 border-t border-line p-5 text-sm">
                <ShieldCheck size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                Only people who called you get a text. No lists, no cold outreach.
              </p>
            </section>
          </Reveal>

          <aside>
            <Reveal immediate delay={0.2}>
              <h2 className="font-semibold">What a conversation looks like</h2>
              <p className="text-sm text-muted-foreground">Sample, for a power washing company</p>
            </Reveal>
            <ol className="mt-3 space-y-4 overflow-hidden rounded-lg border border-line bg-white p-4">
              {conversation.map((m, i) => (
                <Bubble key={i} index={i} {...m} />
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
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd>
        <p className="num font-semibold">{value}</p>
        {children ? <p className="mt-1 text-sm">{children}</p> : null}
      </dd>
    </div>
  );
}

// Messages appear one after another, sliding in from their side. Cult UI's
// speech bubble draws the bubble and tail; we recolour it per speaker.
function Bubble({ from, text, time, index }: { from: string; text: string; time?: string; index: number }) {
  const delay = 0.3 + index * 0.2;

  if (from === "system") {
    const booked = text.startsWith("Booked");
    return (
      <Reveal as="li" delay={delay} y={8} className="flex items-center justify-center gap-1.5 py-1 text-sm text-muted-foreground">
        {booked ? <CircleCheck size={14} aria-hidden="true" /> : <PhoneMissed size={14} aria-hidden="true" />}
        {booked ? (
          <span>
            Booked. Driveway and patio, est. <Money amount={450} className="font-semibold" />
          </span>
        ) : (
          <span>{text}</span>
        )}
        {time ? <span className="num">· {time}</span> : null}
      </Reveal>
    );
  }
  if (from === "owner-note") {
    return (
      <Reveal as="li" delay={delay} y={8} className="rounded-md border border-line bg-surface px-3 py-2 text-sm">
        {text}
      </Reveal>
    );
  }
  const mine = from === "business";
  return (
    <Reveal as="li" delay={delay} y={0} x={mine ? 32 : -32} className={cn("flex", mine ? "justify-end pr-3" : "justify-start pl-3")}>
      <div className={cn("max-w-[85%]", mine ? "text-right" : "text-left")}>
        <SpeechBubbleRoot className={cn("m-0", mine ? "ml-auto" : "")}>
          <SpeechBubbleBody
            className={cn(
              "rounded-lg px-3.5 py-2.5 text-left text-sm lg:px-3.5 lg:py-2.5",
              mine ? "bg-navy text-white" : "bg-surface text-ink",
            )}
          >
            <span>{text}</span>
            <SpeechBubbleTail
              className={cn("h-4 md:h-4", mine ? "right-[-8px] text-navy" : "right-auto left-[-8px] -scale-x-100 text-surface")}
              fill="currentColor"
            />
          </SpeechBubbleBody>
        </SpeechBubbleRoot>
        {time ? <p className="num mt-1 text-sm text-muted-foreground">{time}</p> : null}
      </div>
    </Reveal>
  );
}

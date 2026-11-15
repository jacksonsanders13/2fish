"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CircleCheck, PhoneMissed, Send, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MinimalCard, MinimalCardContent } from "@/components/ui/minimal-card";
import { SpeechBubbleBody, SpeechBubbleRoot, SpeechBubbleTail } from "@/components/ui/speech-bubble";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { logMissedCall, saveTextbackSettings, sendReply, setTextbackEnabled } from "@/lib/app/actions";
import { formatPhone, hourLabel, type Business, type Conversation, type TextbackSettings } from "@/lib/app/types";
import { cn } from "@/lib/utils";
import { Field, LogJobForm, Notice, selectClass } from "./forms";

export function TextBackView({
  business,
  settings,
  conversations,
  smsConfigured,
  selectedPhone,
}: {
  business: Business;
  settings: TextbackSettings;
  conversations: Conversation[];
  smsConfigured: boolean;
  selectedPhone?: string;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(settings.enabled);
  const [pending, start] = useTransition();
  const [notice, setNotice] = useState<{ tone: "error" | "success" | "info"; text: string } | null>(null);
  const selected = conversations.find((c) => c.phone === selectedPhone) ?? conversations[0] ?? null;

  function toggle(v: boolean) {
    setEnabled(v);
    start(async () => {
      const res = await setTextbackEnabled(v);
      if (!res.ok) {
        setEnabled(!v);
        setNotice({ tone: "error", text: res.message });
      }
      router.refresh();
    });
  }

  return (
    <>
      <Reveal immediate y={16}>
        <header className="max-w-2xl">
          <p className="text-sm text-muted-foreground">Your plan</p>
          <h1 className="mt-1 text-display font-bold">Text back every missed call</h1>
          <p className="mt-3">
            When you can&apos;t pick up, the caller gets a text within seconds. Replies land here. Log the jobs you
            win from it and they count toward recovered.
          </p>
        </header>
      </Reveal>

      <Reveal immediate delay={0.1} className="mt-6">
        {smsConfigured ? (
          <Notice tone="success">Texting is connected. Messages go out for real within your texting hours.</Notice>
        ) : (
          <Notice>
            Texting isn&apos;t connected to a phone line yet. Everything here works, but texts are saved as
            &quot;queued&quot; instead of sent. Connecting Twilio turns them on.
          </Notice>
        )}
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="min-w-0 space-y-6">
          <Reveal immediate delay={0.15}>
            <MinimalCard className="rounded-lg bg-white p-0 shadow-none hover:bg-white">
              <MinimalCardContent className="p-0">
                <div className="flex items-center justify-between gap-4 border-b border-line p-5">
                  <div>
                    <h2 className="font-bold">Setup</h2>
                    <p className="text-sm text-muted-foreground">{enabled ? "On. Missed calls get a text." : "Off. Nothing is sent."}</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <Switch checked={enabled} onCheckedChange={toggle} disabled={pending} aria-label="Text-back on or off" />
                    {enabled ? "On" : "Off"}
                  </label>
                </div>
                <div className="p-5">
                  <SettingsForm business={business} settings={settings} onSaved={(t) => setNotice({ tone: "success", text: t })} />
                </div>
                <p className="flex gap-2 border-t border-line p-5 text-sm">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  Only people who called you get a text. Replies to STOP and HELP are handled automatically once texting is connected.
                </p>
              </MinimalCardContent>
            </MinimalCard>
          </Reveal>

          <Reveal delay={0.2}>
            <MinimalCard className="rounded-lg bg-white p-0 shadow-none hover:bg-white">
              <MinimalCardContent className="p-5">
                <h2 className="font-bold">Log a missed call</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Until your phone line is connected, type in the number you missed and 2fish sends the first text for you.
                </p>
                <MissedCallForm onDone={(t) => setNotice({ tone: "info", text: t })} />
              </MinimalCardContent>
            </MinimalCard>
          </Reveal>

          {notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null}
        </div>

        <Reveal immediate delay={0.25} x={24} y={0} className="min-w-0">
          <h2 className="font-bold">Inbox</h2>
          <p className="text-sm text-muted-foreground">{conversations.length === 0 ? "No conversations yet." : `${conversations.length} ${conversations.length === 1 ? "conversation" : "conversations"}`}</p>
          <MinimalCard className="mt-3 rounded-lg bg-white p-0 shadow-none hover:bg-white">
            <MinimalCardContent className="p-0">
              {conversations.length > 0 ? (
                <ul className="max-h-56 divide-y divide-line overflow-y-auto border-b border-line">
                  {conversations.map((c) => (
                    <li key={c.phone}>
                      <button
                        type="button"
                        onClick={() => router.push(`/dashboard/text-back?phone=${encodeURIComponent(c.phone)}`)}
                        className={cn("flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-surface", selected?.phone === c.phone && "bg-surface")}
                      >
                        <span className="min-w-0">
                          <span className="block font-semibold">{c.customerName || formatPhone(c.phone)}</span>
                          <span className="block truncate text-muted-foreground">{c.last.direction === "missed-call" ? "Missed call" : c.last.body}</span>
                        </span>
                        <span className="num shrink-0 text-muted-foreground">{short(c.last.createdAt)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {selected ? <Thread conversation={selected} /> : <p className="p-4 text-sm text-muted-foreground">Log a missed call and the conversation shows up here.</p>}
            </MinimalCardContent>
          </MinimalCard>
        </Reveal>
      </div>
    </>
  );
}

function SettingsForm({ business, settings, onSaved }: { business: Business; settings: TextbackSettings; onSaved: (t: string) => void }) {
  const router = useRouter();
  const [form, setForm] = useState({
    forwardNumber: formatPhone(settings.forwardNumber || business.phone),
    template: settings.template,
    hoursStart: String(settings.hoursStart),
    hoursEnd: String(settings.hoursEnd),
    delaySeconds: String(settings.delaySeconds),
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await saveTextbackSettings(form);
      if (!res.ok) return setError(res.message);
      onSaved("Text-back settings saved.");
      router.refresh();
    });
  }

  const hours = Array.from({ length: 24 }, (_, h) => h);
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Your business line" htmlFor="tb-number" hint="The number customers call. Missed calls on it trigger the text.">
        <Input id="tb-number" type="tel" inputMode="tel" value={form.forwardNumber} onChange={(e) => setForm({ ...form, forwardNumber: e.target.value })} placeholder="(919) 555-0188" />
      </Field>
      <Field label="First message" htmlFor="tb-template" hint={`${form.template.length} of 320 characters.`}>
        <Textarea id="tb-template" rows={4} maxLength={320} value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })} className="field-sizing-fixed resize-none text-sm" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Texting from" htmlFor="tb-start">
          <select id="tb-start" value={form.hoursStart} onChange={(e) => setForm({ ...form, hoursStart: e.target.value })} className={selectClass}>
            {hours.map((h) => (
              <option key={h} value={h}>
                {hourLabel(h)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Until" htmlFor="tb-end">
          <select id="tb-end" value={form.hoursEnd} onChange={(e) => setForm({ ...form, hoursEnd: e.target.value })} className={selectClass}>
            {hours.slice(1).concat(24).map((h) => (
              <option key={h} value={h}>
                {h === 24 ? "Midnight" : hourLabel(h)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Send after" htmlFor="tb-delay">
          <select id="tb-delay" value={form.delaySeconds} onChange={(e) => setForm({ ...form, delaySeconds: e.target.value })} className={selectClass}>
            {[10, 20, 30, 60].map((s) => (
              <option key={s} value={s}>
                {s} seconds
              </option>
            ))}
          </select>
        </Field>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}

function MissedCallForm({ onDone }: { onDone: (t: string) => void }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await logMissedCall({ phone, name });
      if (!res.ok) return setError(res.message);
      setPhone("");
      setName("");
      onDone(res.message ?? "Logged.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <Field label="Caller's number" htmlFor="mc-phone">
        <Input id="mc-phone" type="tel" inputMode="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(919) 555-0142" />
      </Field>
      <Field label="Name, if you know it" htmlFor="mc-name">
        <Input id="mc-name" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Button type="submit" disabled={pending}>
        <PhoneMissed aria-hidden="true" />
        {pending ? "Logging…" : "Log it"}
      </Button>
      {error ? (
        <div className="sm:col-span-3">
          <Notice tone="error">{error}</Notice>
        </div>
      ) : null}
    </form>
  );
}

function Thread({ conversation }: { conversation: Conversation }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [showJob, setShowJob] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await sendReply({ phone: conversation.phone, body });
      if (!res.ok) return setError(res.message);
      setBody("");
      router.refresh();
    });
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{conversation.customerName || "Unknown caller"}</p>
          <p className="num text-sm text-muted-foreground">{formatPhone(conversation.phone)}</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowJob((v) => !v)}>
          <CircleCheck aria-hidden="true" />
          Won the job
        </Button>
      </div>
      {showJob ? (
        <div className="mt-3 rounded-md border border-line bg-surface p-3">
          <LogJobForm
            compact
            customers={conversation.customerId ? [{ id: conversation.customerId, name: conversation.customerName ?? "", phone: conversation.phone }] : []}
            defaultCustomerId={conversation.customerId ?? ""}
            defaultSource="text-back"
            onDone={() => setShowJob(false)}
          />
        </div>
      ) : null}
      <ol className="mt-4 max-h-80 space-y-3 overflow-x-hidden overflow-y-auto">
        {conversation.messages.map((m) => (
          <Bubble key={m.id} direction={m.direction} body={m.body} status={m.status} at={m.createdAt} />
        ))}
      </ol>
      <form onSubmit={submit} className="mt-4 flex gap-2">
        <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Reply…" maxLength={640} aria-label="Reply" />
        <Button type="submit" disabled={pending || !body.trim()} aria-label="Send">
          <Send aria-hidden="true" />
        </Button>
      </form>
      {error ? (
        <div className="mt-2">
          <Notice tone="error">{error}</Notice>
        </div>
      ) : null}
    </div>
  );
}

function Bubble({ direction, body, status, at }: { direction: string; body: string; status: string; at: string }) {
  if (direction === "missed-call") {
    return (
      <li className="flex items-center justify-center gap-1.5 py-1 text-sm text-muted-foreground">
        <PhoneMissed size={14} aria-hidden="true" />
        Missed call <span className="num">· {short(at)}</span>
      </li>
    );
  }
  const mine = direction === "out";
  return (
    <li className={cn("flex", mine ? "justify-end pr-3" : "justify-start pl-3")}>
      <div className={cn("max-w-[85%]", mine ? "text-right" : "text-left")}>
        <SpeechBubbleRoot className={cn("m-0", mine ? "ml-auto" : "")}>
          <SpeechBubbleBody className={cn("rounded-lg px-3.5 py-2.5 text-left text-sm lg:px-3.5 lg:py-2.5", mine ? "bg-navy text-white" : "bg-surface text-ink")}>
            <span>{body}</span>
            <SpeechBubbleTail className={cn("h-4 md:h-4", mine ? "right-[-8px] text-navy" : "right-auto left-[-8px] -scale-x-100 text-surface")} fill="currentColor" />
          </SpeechBubbleBody>
        </SpeechBubbleRoot>
        <p className="num mt-1 text-sm text-muted-foreground">
          {short(at)}
          {mine && status !== "sent" && status !== "delivered" ? ` · ${status}` : ""}
        </p>
      </div>
    </li>
  );
}

function short(iso: string) {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return today ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

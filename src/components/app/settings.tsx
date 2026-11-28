"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Download } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MinimalCard, MinimalCardContent } from "@/components/ui/minimal-card";
import { changePassword, deleteAccount, updateBusiness } from "@/lib/app/actions";
import { disconnectSquareNow, syncSquareNow } from "@/lib/integrations/square-actions";
import { disconnectInstagramNow } from "@/lib/integrations/instagram-actions";
import { setPackDay } from "@/lib/pilot/actions";
import { WEEKDAYS } from "@/lib/pilot/dates";
import { BUSINESS_KINDS, formatPhone, type Business } from "@/lib/app/types";
import { Field, Notice, selectClass } from "./forms";

type SquareState = { ready: boolean; connectedAt: string | null; syncedAt: string | null; status: string | null };
type InstagramState = { ready: boolean; connectedAt: string | null; username: string | null; status: string | null };

export function SettingsView({ email, business, square, instagram, packDay }: { email: string; business: Business; square: SquareState; instagram: InstagramState; packDay: number }) {
  return (
    <>
      <Reveal immediate y={16}>
        <h1 className="text-display font-bold">Settings</h1>
        <p className="mt-2">Change your business details or password, download what 2fish knows, or close your account.</p>
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Reveal immediate delay={0.05}>
          <Card title="Square" sub="2fish reads your sales so it can tell which posts sold. It can't change anything in Square.">
            <SquareCard square={square} />
          </Card>
        </Reveal>

        <Reveal immediate delay={0.06}>
          <Card title="Instagram" sub="Connect once and every post you approve goes up by itself on its day, in the morning. Nothing posts without your okay.">
            <InstagramCard instagram={instagram} />
          </Card>
        </Reveal>

        <Reveal immediate delay={0.08}>
          <Card title="Weekly posts" sub="Pick the day 2fish writes your next 7 posts. You get a text to approve them, and a photo request 3 days before.">
            <PackDayForm initial={packDay} />
          </Card>
        </Reveal>

        <Reveal immediate delay={0.1}>
          <Card title="Your business" sub="Shows up in your texts and on your plan.">
            <BusinessForm business={business} />
          </Card>
        </Reveal>

        <Reveal immediate delay={0.15}>
          <Card title="Account" sub={`Signed in as ${email}.`}>
            <PasswordForm />
          </Card>
        </Reveal>

        <Reveal delay={0.2}>
          <Card title="Plan" sub="Free while we build. Paid plans: Solo $20, Growing $50, Established $75 a month.">
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="font-semibold">Current plan</dt>
                <dd>Free</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-semibold">Paid plans</dt>
                <dd className="text-muted-foreground">Coming soon</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-muted-foreground">Billing opens when the first paid step is ready. Nothing to do now.</p>
          </Card>
        </Reveal>

        <Reveal delay={0.25}>
          <Card title="Your data" sub="Take it with you, or delete everything.">
            <Button asChild variant="outline">
              <a href="/api/export" download>
                <Download aria-hidden="true" />
                Download my data
              </a>
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">One file with your business, plan, customers, jobs and messages.</p>
            <div className="mt-6 border-t border-line pt-5">
              <DeleteForm />
            </div>
          </Card>
        </Reveal>
      </div>
    </>
  );
}

function PackDayForm({ initial }: { initial: number }) {
  const [day, setDay] = useState(String(initial));
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await setPackDay({ day });
          setMsg(r.ok ? `Saved. Your posts get written every ${WEEKDAYS[Number(day)]}.` : r.message ?? "Something went wrong.");
        });
      }}
    >
      <label className="text-sm font-semibold">
        Write my posts on
        <select value={day} onChange={(e) => setDay(e.target.value)} className="mt-1 block h-10 rounded-md border border-input bg-white px-2 font-normal">
          {WEEKDAYS.map((d, i) => (
            <option key={d} value={i}>
              {d}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" variant="outline" disabled={pending}>
        Save
      </Button>
      {msg ? (
        <p className="w-full text-sm" role="status">
          {msg}
        </p>
      ) : null}
    </form>
  );
}

function SquareCard({ square }: { square: SquareState }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(
    square.status === "connected" ? "Connected. Your last 90 days of sales are in." : square.status === "failed" ? "Square didn't connect. Try again." : null,
  );

  if (!square.ready) return <p className="text-sm text-muted-foreground">Not switched on yet. It works once 2fish&apos;s Square keys are added.</p>;

  if (!square.connectedAt) {
    return (
      <>
        <Button asChild variant="signal">
          <a href="/api/square/connect">Connect Square</a>
        </Button>
        {msg ? <p className="mt-2 text-sm" role="status">{msg}</p> : null}
      </>
    );
  }

  const synced = square.syncedAt ? new Date(square.syncedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "not yet";
  return (
    <>
      <p className="text-sm">
        <span className="font-semibold">Connected.</span> Last sync: {synced}. It syncs every morning on its own.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="outline"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await syncSquareNow();
              setMsg(r.message);
              router.refresh();
            })
          }
        >
          {pending ? "Syncing…" : "Sync now"}
        </Button>
        <Button
          variant="ghost"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await disconnectSquareNow();
              setMsg("Disconnected.");
              router.refresh();
            })
          }
        >
          Disconnect
        </Button>
      </div>
      {msg ? <p className="mt-2 text-sm" role="status">{msg}</p> : null}
    </>
  );
}

function InstagramCard({ instagram }: { instagram: InstagramState }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(
    instagram.status === "connected" ? "Connected. Approved posts will go up on their day." : instagram.status === "failed" ? "Instagram didn't connect. Make sure it's a business or creator account, then try again." : null,
  );

  if (!instagram.ready) {
    return <p className="text-sm text-muted-foreground">Not switched on yet. Until Instagram approves 2fish, copy each post from the dashboard and post it yourself.</p>;
  }

  if (!instagram.connectedAt) {
    return (
      <>
        <Button asChild variant="signal">
          <a href="/api/instagram/connect">Connect Instagram</a>
        </Button>
        <p className="mt-2 text-sm text-muted-foreground">Needs an Instagram business or creator account. Switching is free in the Instagram app.</p>
        {msg ? <p className="mt-2 text-sm" role="status">{msg}</p> : null}
      </>
    );
  }

  return (
    <>
      <p className="text-sm">
        <span className="font-semibold">Connected{instagram.username ? ` as @${instagram.username}` : ""}.</span> Approved posts go up on their day.
      </p>
      <div className="mt-3">
        <Button
          variant="ghost"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await disconnectInstagramNow();
              setMsg("Disconnected. Posts won't go up by themselves.");
              router.refresh();
            })
          }
        >
          Disconnect
        </Button>
      </div>
      {msg ? <p className="mt-2 text-sm" role="status">{msg}</p> : null}
    </>
  );
}

function Card({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <MinimalCard className="h-full rounded-lg bg-white p-0 shadow-none hover:bg-white">
      <MinimalCardContent className="p-5">
        <h2 className="font-bold">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{sub}</p>
        <div className="mt-4">{children}</div>
      </MinimalCardContent>
    </MinimalCard>
  );
}

function BusinessForm({ business }: { business: Business }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: business.name, kind: business.kind || "Something else", phone: business.phone ? formatPhone(business.phone) : "", city: business.city });
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const res = await updateBusiness(form);
      setMsg(res.ok ? { tone: "success", text: "Saved." } : { tone: "error", text: res.message });
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Business name" htmlFor="b-name">
        <Input id="b-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Oak & Ash Exterior Cleaning" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type" htmlFor="b-kind">
          <select id="b-kind" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className={selectClass}>
            {BUSINESS_KINDS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        <Field label="City" htmlFor="b-city">
          <Input id="b-city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Raleigh, NC" />
        </Field>
      </div>
      <Field label="Your mobile number" htmlFor="b-phone" hint="2fish texts you here when posts are ready or it needs photos. 8am to 9pm only. Reply STOP any time.">
        <Input id="b-phone" type="tel" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </Field>
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
      <Button type="submit" variant="signal" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

function PasswordForm() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const ok = password.length >= 8 && /\d/.test(password);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const res = await changePassword({ password });
      setMsg(res.ok ? { tone: "success", text: "Password changed." } : { tone: "error", text: res.message });
      if (res.ok) setPassword("");
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="New password" htmlFor="pw" hint="At least 8 characters and one number.">
        <Input id="pw" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
      <Button type="submit" variant="outline" disabled={pending || !ok}>
        {pending ? "Changing…" : "Change password"}
      </Button>
    </form>
  );
}

function DeleteForm() {
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await deleteAccount(confirm);
      if (res && !res.ok) setError(res.message);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <h3 className="font-semibold">Delete my account</h3>
      <p className="text-sm text-muted-foreground">Removes your store, uploads, posts, sales numbers, chats, and your Square and Instagram connections for good. Type DELETE to confirm.</p>
      <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="DELETE" aria-label="Type DELETE to confirm" className="max-w-xs" />
      {error ? <Notice tone="error">{error}</Notice> : null}
      {/* Outlined, so a solid coral button always means "go" and never gets mistaken for this one. */}
      <Button
        type="submit"
        variant="outline"
        disabled={pending || confirm !== "DELETE"}
        className="border-destructive text-destructive hover:bg-destructive hover:text-white"
      >
        {pending ? "Deleting…" : "Delete my account"}
      </Button>
    </form>
  );
}

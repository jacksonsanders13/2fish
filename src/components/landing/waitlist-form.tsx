"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinWaitlist } from "@/lib/waitlist";
import { cn } from "@/lib/utils";

// Email plus two optional fields. Built for the dark closing band.
export function WaitlistForm({ className }: { className?: string }) {
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ email: "", store: "", plan: "", website: "" });
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <p role="status" className={cn("flex items-center gap-2 text-lg font-semibold text-white", className)}>
        <Check aria-hidden="true" className="confirm shrink-0" />
        {done}
      </p>
    );
  }

  return (
    <form
      className={cn("w-full max-w-md", className)}
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const r = await joinWaitlist(form as Parameters<typeof joinWaitlist>[0]);
          if (r.ok) setDone(r.message);
          else setError(r.message);
        });
      }}
    >
      <label htmlFor="wl-email" className="text-sm font-semibold text-white">
        Email
      </label>
      <Input
        id="wl-email"
        type="email"
        required
        autoComplete="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="mt-1 h-12 bg-white text-base text-ink"
        placeholder="you@yourstore.com"
      />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="wl-store" className="text-sm font-semibold text-white">
            Store name <span className="font-normal text-on-night-muted">(optional)</span>
          </label>
          <Input id="wl-store" value={form.store} onChange={(e) => setForm({ ...form, store: e.target.value })} className="mt-1 h-11 bg-white text-ink" />
        </div>
        <div>
          <label htmlFor="wl-plan" className="text-sm font-semibold text-white">
            Plan you&apos;d want <span className="font-normal text-on-night-muted">(optional)</span>
          </label>
          <select
            id="wl-plan"
            value={form.plan}
            onChange={(e) => setForm({ ...form, plan: e.target.value })}
            className="mt-1 block h-11 w-full rounded-md border border-input bg-white px-2 text-sm text-ink"
          >
            <option value="">Pick one</option>
            <option value="starter">Solo, $20</option>
            <option value="growth">Growing, $50</option>
            <option value="pro">Established, $75</option>
            <option value="not sure">Not sure yet</option>
          </select>
        </div>
      </div>
      {/* Hidden from people; bots fill it in */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={form.website}
        onChange={(e) => setForm({ ...form, website: e.target.value })}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <Button type="submit" size="lg" variant="signal" className="mt-4 h-12 w-full text-base" disabled={pending}>
        {pending ? "Adding you…" : "Join the waitlist"}
        <ArrowRight aria-hidden="true" />
      </Button>
      {error ? (
        <p role="alert" className="mt-2 text-sm font-semibold text-white">
          {error}
        </p>
      ) : null}
      <p className="mt-3 text-sm text-on-night-muted">We&apos;ll only email you about 2fish opening. Unsubscribe any time.</p>
    </form>
  );
}

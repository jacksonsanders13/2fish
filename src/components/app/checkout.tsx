"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Money } from "@/components/ui/money";
import { deleteCheckout, logCheckout } from "@/lib/pilot/actions";
import { SOURCES, sourceLabel, type Checkout, type SourceId } from "@/lib/pilot/types";
import { cn } from "@/lib/utils";

// Built for the counter: one tap for how they heard about you, type the total, done.
export function CheckoutView({ checkouts, posts }: { checkouts: Checkout[]; posts: { id: string; label: string }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [source, setSource] = useState<SourceId | null>(null);
  const [amount, setAmount] = useState("");
  const [postId, setPostId] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string; at: number } | null>(null);

  const fromPosts = checkouts.filter((c) => c.source === "post");
  const postTotal = fromPosts.reduce((s, c) => s + c.amount, 0);
  const dayTotal = checkouts.reduce((s, c) => s + c.amount, 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!source) return setMsg({ ok: false, text: "Tap how they heard about you first.", at: Date.now() });
    start(async () => {
      const r = await logCheckout({ source, amount, postId: source === "post" && postId ? postId : null });
      setMsg({ ok: r.ok, text: r.message ?? "", at: Date.now() });
      if (r.ok) {
        setSource(null);
        setAmount("");
        setPostId("");
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <form onSubmit={submit} className="rounded-lg bg-white p-5">
        <h1 className="text-display font-semibold">How&apos;d you hear about us?</h1>
        <p className="mt-2 text-sm text-muted-foreground">Ask at checkout, tap the answer, type the total.</p>

        <fieldset className="mt-5">
          <legend className="sr-only">How they heard about the store</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SOURCES.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={source === s.id}
                onClick={() => setSource(s.id)}
                className={cn(
                  "h-14 rounded-md border text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
                  source === s.id ? "border-night bg-night text-white" : "border-line bg-white text-ink hover:border-night",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>

        {source === "post" && posts.length ? (
          <div className="mt-4">
            <label htmlFor="co-post" className="text-sm font-semibold">
              Which post? <span className="font-normal text-muted-foreground">(if they remember)</span>
            </label>
            <select
              id="co-post"
              value={postId}
              onChange={(e) => setPostId(e.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-input bg-white px-3 text-sm focus-visible:border-night focus-visible:outline-none"
            >
              <option value="">Not sure</option>
              {posts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <label htmlFor="co-amount" className="mt-5 block text-sm font-semibold">
          Sale total
        </label>
        <div className="mt-2 flex h-14 items-center rounded-md border border-input bg-white pl-3 focus-within:border-night">
          <span className="text-lg text-muted-foreground">$</span>
          <Input
            id="co-amount"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="num h-full border-0 bg-transparent pl-1 text-lg shadow-none focus-visible:ring-0 md:text-lg"
            placeholder="0"
          />
        </div>

        <Button type="submit" size="lg" variant="signal" className="mt-5 h-14 w-full text-base" disabled={pending}>
          {pending ? "Saving…" : "Log this sale"}
        </Button>
        {msg ? (
          <p role="status" className={cn("mt-3 text-sm", msg.ok ? "font-semibold text-night" : "font-semibold text-destructive")}>
            {/* new key each save so the pulse replays */}
            <span key={msg.at} className={msg.ok ? "confirm" : undefined}>
              {msg.text}
            </span>
          </p>
        ) : null}
      </form>

      <aside className="self-start rounded-lg bg-white p-5">
        <h2 className="font-semibold">Today</h2>
        <p className="mt-1 text-sm">
          <Money amount={postTotal} className="font-semibold" /> from {fromPosts.length} {fromPosts.length === 1 ? "shopper" : "shoppers"} who saw a post. <Money amount={dayTotal} tone="ink" /> logged in all.
        </p>
        {checkouts.length ? (
          <ul className="mt-4 space-y-2">
            {checkouts.map((c) => (
              <CheckoutRow key={c.id} c={c} />
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Nothing logged yet today.</p>
        )}
      </aside>
    </div>
  );
}

function CheckoutRow({ c }: { c: Checkout }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const time = new Date(c.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return (
    <li className="flex items-center justify-between gap-2 text-sm">
      <span className="num w-16 shrink-0 text-muted-foreground">{time}</span>
      <span className="min-w-0 flex-1">{sourceLabel(c.source)}</span>
      <Money amount={c.amount} tone={c.source === "post" ? "cash" : "ink"} className="shrink-0 font-semibold" />
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await deleteCheckout({ id: c.id });
            router.refresh();
          })
        }
        className="flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-ink focus-visible:outline-2 focus-visible:outline-signal"
      >
        <X size={14} aria-hidden="true" />
        <span className="sr-only">Remove this sale</span>
      </button>
    </li>
  );
}

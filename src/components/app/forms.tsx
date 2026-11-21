"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logJob } from "@/lib/app/actions";
import { STEP_SOURCES, type Customer } from "@/lib/app/types";
import { cn } from "@/lib/utils";

// Small building blocks shared by the app forms.

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint ? <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "success"; children: React.ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        tone === "error" ? "border-destructive/40 text-destructive" : tone === "success" ? "border-night text-ink" : "border-line bg-surface",
      )}
    >
      {children}
    </p>
  );
}

export const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

/** Log a job you won. This is the number the dashboard adds up. */
export function LogJobForm({
  customers = [],
  defaultCustomerId = "",
  defaultSource = "text-back",
  compact = false,
  onDone,
}: {
  customers?: Pick<Customer, "id" | "name" | "phone">[];
  defaultCustomerId?: string;
  defaultSource?: string;
  compact?: boolean;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [customerId, setCustomerId] = useState(defaultCustomerId);
  const [source, setSource] = useState(defaultSource);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const res = await logJob({ value, customerId, sourceStep: source, note });
      if (!res.ok) return setMsg({ tone: "error", text: res.message });
      setValue("");
      setNote("");
      setMsg({ tone: "success", text: "Logged. It's counted in this month's recovered total." });
      router.refresh();
      onDone?.();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className={cn("grid gap-3", compact ? "" : "sm:grid-cols-2")}>
        <Field label="Job value" htmlFor="job-value">
          <div className="flex h-10 items-center rounded-md border border-input bg-background pl-3 focus-within:border-night">
            <span className="text-muted-foreground">$</span>
            <Input
              id="job-value"
              type="number"
              inputMode="numeric"
              min={1}
              required
              placeholder="450"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="num h-full border-0 pl-1 focus-visible:ring-0"
            />
          </div>
        </Field>
        <Field label="Came from" htmlFor="job-source">
          <select id="job-source" value={source} onChange={(e) => setSource(e.target.value)} className={selectClass}>
            {STEP_SOURCES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {customers.length > 0 ? (
        <Field label="Customer" htmlFor="job-customer">
          <select id="job-customer" value={customerId} onChange={(e) => setCustomerId(e.target.value)} className={selectClass}>
            <option value="">Not in the list</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.phone}
              </option>
            ))}
          </select>
        </Field>
      ) : null}
      <Field label="Note" htmlFor="job-note" hint="Optional. Something like 'driveway and patio'.">
        <Input id="job-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} />
      </Field>
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
      <Button type="submit" variant="signal" disabled={pending} className={compact ? "w-full" : undefined}>
        {pending ? "Saving…" : "Log this job"}
      </Button>
    </form>
  );
}

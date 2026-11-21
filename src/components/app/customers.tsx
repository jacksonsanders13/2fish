"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MinimalCard, MinimalCardContent } from "@/components/ui/minimal-card";
import { Money } from "@/components/ui/money";
import { Switch } from "@/components/ui/switch";
import { addCustomer, deleteCustomer, importCustomers } from "@/lib/app/actions";
import { formatPhone, type Customer, type Job } from "@/lib/app/types";
import { Field, LogJobForm, Notice } from "./forms";

export function CustomersView({ customers, jobs }: { customers: Customer[]; jobs: Job[] }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(customers.length === 0);
  const [logFor, setLogFor] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function remove(id: string) {
    if (!window.confirm("Remove this customer? Their logged jobs stay.")) return;
    start(async () => {
      const res = await deleteCustomer(id);
      if (!res.ok) setNotice({ tone: "error", text: res.message });
      router.refresh();
    });
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      const rows = parseCsv(text);
      if (rows.length === 0) return setNotice({ tone: "error", text: "Couldn't find any rows. The first line should be headers like name, phone, email, last job, value." });
      start(async () => {
        const res = await importCustomers(rows);
        setNotice(res.ok ? { tone: "success", text: res.message ?? "Imported." } : { tone: "error", text: res.message });
        router.refresh();
      });
    });
    e.target.value = "";
  }

  const jobsByCustomer = new Map<string, number>();
  for (const j of jobs) if (j.customerId) jobsByCustomer.set(j.customerId, (jobsByCustomer.get(j.customerId) ?? 0) + j.value);

  return (
    <>
      <Reveal immediate y={16} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display font-bold">Customers</h1>
          <p className="mt-2 max-w-xl">
            Everyone you&apos;ve served. Review requests and reminders go to this list, and jobs you log here feed the
            recovered total.
          </p>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={pending}>
            <Upload aria-hidden="true" />
            Import CSV
          </Button>
          <Button variant="signal" aria-expanded={showAdd} onClick={() => setShowAdd((v) => !v)}>
            <Plus aria-hidden="true" />
            Add customer
          </Button>
        </div>
      </Reveal>

      {notice ? (
        <div className="mt-4">
          <Notice tone={notice.tone}>{notice.text}</Notice>
        </div>
      ) : null}

      {showAdd ? (
        <Reveal immediate className="mt-6">
          <MinimalCard className="rounded-lg bg-white p-0 shadow-none hover:bg-white">
            <MinimalCardContent className="p-5">
              <h2 className="font-bold">Add a customer</h2>
              <AddCustomerForm onDone={() => setShowAdd(false)} />
            </MinimalCardContent>
          </MinimalCard>
        </Reveal>
      ) : null}

      <Reveal delay={0.1} className="mt-6">
        <MinimalCard className="rounded-lg bg-white p-0 shadow-none hover:bg-white">
          <MinimalCardContent className="p-0">
            {customers.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">
                No customers yet. Add one above, or import a CSV from your invoicing app or a spreadsheet. Columns we
                look for: name, phone, email, last job date, value.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {customers.map((c) => (
                  <li key={c.id} className="p-4 sm:px-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{c.name || "No name"}</p>
                        <p className="num text-sm text-muted-foreground">{c.phone ? formatPhone(c.phone) : "No phone"}</p>
                        {c.email ? <p className="text-sm text-muted-foreground">{c.email}</p> : null}
                        <p className="text-sm text-muted-foreground">
                          {c.lastJobAt
                            ? `Last job ${new Date(c.lastJobAt + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                            : "No job logged"}
                          {c.lastJobValue ? (
                            <>
                              {" for "}
                              <Money amount={c.lastJobValue} tone="ink" />
                            </>
                          ) : null}
                        </p>
                        {jobsByCustomer.get(c.id) || c.smsConsent ? (
                          <p className="text-sm text-muted-foreground">
                            {jobsByCustomer.get(c.id) ? (
                              <>
                                <Money amount={jobsByCustomer.get(c.id)!} /> won through 2fish
                                {c.smsConsent ? ". " : ""}
                              </>
                            ) : null}
                            {c.smsConsent ? "OK to text" : ""}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setLogFor(logFor === c.id ? null : c.id)}>
                          Log a job
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(c.id)} aria-label={`Remove ${c.name}`}>
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                    {logFor === c.id ? (
                      <div className="mt-4">
                        <LogJobForm customers={[c]} defaultCustomerId={c.id} defaultSource="other" onDone={() => setLogFor(null)} />
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </MinimalCardContent>
        </MinimalCard>
      </Reveal>
    </>
  );
}

function AddCustomerForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", email: "", lastJobAt: "", lastJobValue: "", smsConsent: true });
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await addCustomer({
        ...form,
        lastJobValue: form.lastJobValue ? Number(form.lastJobValue) : undefined,
      });
      if (!res.ok) return setError(res.message);
      router.refresh();
      onDone();
    });
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="c-name">
          <Input id="c-name" required value={form.name} onChange={set("name")} />
        </Field>
        <Field label="Phone" htmlFor="c-phone">
          <Input id="c-phone" type="tel" inputMode="tel" value={form.phone} onChange={set("phone")} placeholder="(919) 555-0188" />
        </Field>
        <Field label="Email" htmlFor="c-email">
          <Input id="c-email" type="email" value={form.email} onChange={set("email")} />
        </Field>
        <Field label="Last job date" htmlFor="c-date">
          <Input id="c-date" type="date" value={form.lastJobAt} onChange={set("lastJobAt")} />
        </Field>
        <Field label="Last job value" htmlFor="c-value">
          <Input id="c-value" type="number" inputMode="numeric" min={0} value={form.lastJobValue} onChange={set("lastJobValue")} placeholder="385" />
        </Field>
        <Field label="OK to text them" htmlFor="c-consent" hint="Only text people who called you or said yes.">
          <label className="flex h-10 items-center gap-2 text-sm">
            <Switch id="c-consent" checked={form.smsConsent} onCheckedChange={(v) => setForm((f) => ({ ...f, smsConsent: v }))} />
            {form.smsConsent ? "Yes" : "No"}
          </label>
        </Field>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <div className="flex gap-2">
        <Button type="submit" variant="signal" disabled={pending}>
          {pending ? "Saving…" : "Save customer"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// A forgiving CSV reader: finds the columns by header name, in any order.
function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const split = (line: string) => {
    const out: string[] = [];
    let cur = "";
    let q = false;
    for (const ch of line) {
      if (ch === '"') q = !q;
      else if (ch === "," && !q) {
        out.push(cur.trim());
        cur = "";
      } else cur += ch;
    }
    out.push(cur.trim());
    return out;
  };
  const headers = split(lines[0]).map((h) => h.toLowerCase());
  const col = (...names: string[]) => headers.findIndex((h) => names.some((n) => h.includes(n)));
  const iName = col("name"), iPhone = col("phone", "mobile", "cell"), iEmail = col("email"), iDate = col("date", "last job"), iValue = col("value", "amount", "total");
  return lines.slice(1).map(split).filter((r) => r.some(Boolean)).map((r) => ({
    name: iName >= 0 ? r[iName] ?? "" : "",
    phone: iPhone >= 0 ? r[iPhone] ?? "" : "",
    email: iEmail >= 0 ? r[iEmail] ?? "" : "",
    lastJobAt: iDate >= 0 && r[iDate] ? toIsoDate(r[iDate]) : undefined,
    lastJobValue: iValue >= 0 && r[iValue] ? Number(String(r[iValue]).replace(/[^0-9.]/g, "")) || undefined : undefined,
    smsConsent: false,
  })).filter((r) => r.name);
}

function toIsoDate(v: string) {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addExamples, deleteExample } from "@/lib/pilot/examples";
import { POST_KINDS, type Example } from "@/lib/pilot/types";

const empty = { kind: "try-on", hook: "", caption: "", why: "", views: "", likes: "", link: "" };

// Popular posts the agent studies before it writes each week's posts.
export function ExamplesView({ examples, canShare }: { examples: Example[]; canShare: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState(empty);
  const [share, setShare] = useState(canShare);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function save(rows: Record<string, unknown>[]) {
    start(async () => {
      const r = await addExamples({ rows, global: share });
      setMsg(r.message ?? (r.ok ? "Added." : "Something went wrong."));
      if (r.ok) setForm(empty);
      router.refresh();
    });
  }

  async function onCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const rows = parseCsv(await file.text());
    if (!rows.length) return setMsg("That file had no rows. The first row should be the column names.");
    save(rows);
  }

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      <header className="max-w-2xl">
        <h1 className="text-display font-semibold">Post examples</h1>
        <p className="mt-3">
          Add posts that did well. Before writing each week&apos;s posts, 2fish studies these and borrows what made them work: the hook, the
          format, the pacing. It never copies their words.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <form
          className="rounded-lg bg-white p-5"
          onSubmit={(e) => {
            e.preventDefault();
            save([form]);
          }}
        >
          <h2 className="font-semibold">Add one</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Type of post
              <select value={form.kind} onChange={set("kind")} className="mt-1 block h-10 w-full rounded-md border border-input bg-white px-2 font-normal">
                {POST_KINDS.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Link <span className="font-normal text-muted-foreground">(optional)</span>
              <Input value={form.link} onChange={set("link")} className="mt-1 font-normal" placeholder="https://instagram.com/p/…" />
            </label>
          </div>
          <label className="mt-4 block text-sm font-semibold">
            Hook (the first line)
            <Input value={form.hook} onChange={set("hook")} className="mt-1 font-normal" placeholder="3 ways to wear one dress" />
          </label>
          <label className="mt-4 block text-sm font-semibold">
            Caption
            <Textarea value={form.caption} onChange={set("caption")} rows={4} className="mt-1 font-normal" />
          </label>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <label className="text-sm font-semibold">
              Views
              <Input type="number" inputMode="numeric" min={0} value={form.views} onChange={set("views")} className="num mt-1 font-normal" />
            </label>
            <label className="text-sm font-semibold">
              Likes
              <Input type="number" inputMode="numeric" min={0} value={form.likes} onChange={set("likes")} className="num mt-1 font-normal" />
            </label>
          </div>
          <label className="mt-4 block text-sm font-semibold">
            Why it worked <span className="font-normal text-muted-foreground">(optional)</span>
            <Input value={form.why} onChange={set("why")} className="mt-1 font-normal" placeholder="Shows the dress moving, real customer, price in the first second" />
          </label>
          {canShare ? (
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} className="size-4" />
              Use for every store, not just mine
            </label>
          ) : null}
          <Button type="submit" variant="signal" className="mt-5" disabled={pending || (!form.hook.trim() && !form.caption.trim())}>
            {pending ? "Saving…" : "Add example"}
          </Button>
          {msg ? (
            <p className="mt-3 text-sm" role="status">
              {msg}
            </p>
          ) : null}
        </form>

        <aside className="self-start rounded-lg bg-white p-5">
          <h2 className="font-semibold">Add a spreadsheet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A CSV with these column names in the first row: <span className="font-semibold text-ink">hook, caption, kind, views, likes, link, why</span>.
            Only hook or caption is required. Up to 500 rows.
          </p>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onCsv} />
          <Button variant="outline" className="mt-4" disabled={pending} onClick={() => fileRef.current?.click()}>
            <Upload aria-hidden="true" />
            Choose a CSV file
          </Button>
        </aside>
      </div>

      <section className="mt-8">
        <h2 className="font-semibold">
          Your library <span className="num font-normal text-muted-foreground">({examples.length})</span>
        </h2>
        {examples.length ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {examples.map((x) => (
              <ExampleCard key={x.id} x={x} />
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No examples yet. Ten good ones is a solid start.</p>
        )}
      </section>
    </div>
  );
}

function ExampleCard({ x }: { x: Example }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const stats = [x.views != null ? `${x.views.toLocaleString()} views` : "", x.likes != null ? `${x.likes.toLocaleString()} likes` : ""].filter(Boolean).join(" · ");
  return (
    <li className="relative rounded-lg bg-white p-4 text-sm">
      <p className="pr-10 text-muted-foreground">
        {x.kind}
        {stats ? ` · ${stats}` : ""}
        {x.isGlobal ? " · every store" : ""}
      </p>
      {x.hook ? <p className="mt-1 font-semibold">{x.hook}</p> : null}
      {x.caption ? <p className="mt-1 line-clamp-3">{x.caption}</p> : null}
      {x.why ? <p className="mt-2 text-muted-foreground">Why: {x.why}</p> : null}
      {x.mine ? (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await deleteExample({ id: x.id });
              router.refresh();
            })
          }
          className="absolute top-2 right-2 flex size-10 items-center justify-center rounded-md text-muted-foreground hover:text-ink focus-visible:outline-2 focus-visible:outline-signal"
        >
          <X size={16} aria-hidden="true" />
          <span className="sr-only">Remove this example</span>
        </button>
      ) : null}
    </li>
  );
}

// Small CSV reader: handles quoted fields with commas, quotes and line breaks.
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [head, ...body] = rows.filter((r) => r.some((c) => c.trim()));
  if (!head) return [];
  const keys = head.map((h) => h.trim().toLowerCase());
  return body.map((r) => {
    const o: Record<string, string> = {};
    keys.forEach((k, i) => {
      if (["hook", "caption", "kind", "views", "likes", "link", "why"].includes(k)) o[k] = (r[i] ?? "").trim();
    });
    if (o.views === "") delete o.views;
    if (o.likes === "") delete o.likes;
    return o;
  });
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowUp, Check, Clock, Copy, Download, Film, History, SquarePen, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { approveText, clipsUploaded, deleteConversation, dismissTask } from "@/lib/agent/actions";
import type { StreamEvent } from "@/lib/agent/run";
import type { ToolCard } from "@/lib/agent/tools";
import type { Task } from "@/lib/agent/snapshot";
import type { ChatMessage, ChatSummary } from "@/lib/agent/store";
import { formatPhone } from "@/lib/app/types";
import { createClient } from "@/lib/supabase/client";
import { FisherAvatar } from "@/components/brand/fisher-avatar";
import { cn } from "@/lib/utils";
import { useDemo } from "./demo";

type Local = { id: string; role: "user" | "assistant" | "tool"; content: string; meta?: Record<string, unknown>; pending?: boolean };

// Fisher, the marketing helper. A running conversation with the owner, with the work it
// needs from them (uploads, approvals) shown as cards above the composer.
export function Consultant({
  initialMessages,
  tasks,
  agentReady,
  intro,
  userId,
  suggestions,
  onMadePosts,
  chats,
  conversationId,
  firstEver,
  className,
}: {
  initialMessages: ChatMessage[];
  tasks: Task[];
  agentReady: boolean;
  intro: string;
  userId: string;
  suggestions: string[];
  onMadePosts?: () => void;
  chats: ChatSummary[];
  conversationId: string | null;
  firstEver: boolean;
  className?: string;
}) {
  const router = useRouter();
  // The chat being shown. A new chat has no id until its first message is saved.
  const convRef = useRef<string | null>(conversationId);
  const [showChats, setShowChats] = useState(false);
  const [messages, setMessages] = useState<Local[]>(() =>
    initialMessages.length ? initialMessages.map((m) => ({ id: m.id, role: m.role, content: m.content, meta: m.meta })) : [{ id: "intro", role: "assistant", content: intro }],
  );
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // What Fisher is doing right now, and since when, so the owner can tell
  // "working on it" apart from "stuck".
  const [status, setStatus] = useState<{ label: string; slow: boolean; since: number } | null>(null);
  const [now, setNow] = useState(0);
  const lastAsk = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const demo = useDemo();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, tasks]);

  // The owner's very first chat: Fisher opens it. New chats after that wait
  // for the owner, so nobody pays for a greeting they didn't ask for.
  useEffect(() => {
    if (agentReady && firstEver && initialMessages.length === 0 && !startedRef.current) {
      startedRef.current = true;
      void send("Walk me through my plan.", { silentUser: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick once a second while Fisher works, for the "12s" counter.
  useEffect(() => {
    if (!busy) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [busy]);

  async function send(text: string, opts: { silentUser?: boolean } = {}) {
    const clean = text.trim();
    if (!clean || busy) return;
    lastAsk.current = opts.silentUser ? null : clean;
    setStatus({ label: "Reading your store", slow: false, since: Date.now() });
    setNow(Date.now());
    setError(null);
    setShowChats(false);
    setBusy(true);
    setDraft("");
    const userId = `u-${Date.now()}`;
    const assistantId = `a-${Date.now()}`;
    setMessages((m) => [
      ...(opts.silentUser ? m.filter((x) => x.id !== "intro") : m),
      ...(opts.silentUser ? [] : [{ id: userId, role: "user" as const, content: clean }]),
      { id: assistantId, role: "assistant" as const, content: "", pending: true },
    ]);

    if (demo) {
      // Test drive: a written answer after a short pause, nothing sent anywhere.
      const answer = demo.reply(clean);
      await new Promise((r) => setTimeout(r, 900));
      setMessages((m) => m.map((x) => (x.id === assistantId ? { ...x, content: answer, pending: false } : x)));
      setBusy(false);
      return;
    }

    // If nothing at all arrives for 45 seconds, the connection is gone. The
    // server pings every 8 seconds during long jobs, so silence means broken.
    const abort = new AbortController();
    let watchdog = window.setTimeout(() => abort.abort(), 45_000);
    const alive = () => {
      window.clearTimeout(watchdog);
      watchdog = window.setTimeout(() => abort.abort(), 45_000);
    };
    let finished = false;

    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: clean, conversationId: convRef.current }), signal: abort.signal });
      if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({ error: "Could not reach Fisher." }))).error);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const handle = (ev: StreamEvent) => {
        alive();
        if (ev.type === "status") {
          setStatus({ label: ev.label, slow: ev.slow, since: Date.now() });
        } else if (ev.type === "ping") {
          // nothing to show, just proof of life
        } else if (ev.type === "text") {
          if (ev.delta) setStatus(null);
          setMessages((m) => m.map((x) => (x.id === assistantId ? { ...x, content: x.content + ev.delta } : x)));
        } else if (ev.type === "tool") {
          if (ev.madePosts) onMadePosts?.();
          setMessages((m) => {
            const i = m.findIndex((x) => x.id === assistantId);
            const chip: Local = { id: `t-${Date.now()}-${Math.random()}`, role: "tool", content: ev.summary, meta: { name: ev.name, ...(ev.card ? { card: ev.card } : {}) } };
            return [...m.slice(0, i), chip, ...m.slice(i)];
          });
        } else if (ev.type === "conversation") {
          // A new chat was just saved: keep using it, and put it in the link.
          convRef.current = ev.id;
          window.history.replaceState(null, "", `/dashboard?chat=${ev.id}`);
        } else if (ev.type === "error") {
          setError(ev.message);
        } else if (ev.type === "done") {
          finished = true;
          setMessages((m) => m.map((x) => (x.id === assistantId ? { ...x, pending: false } : x)));
        }
      };
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) if (line.trim()) handle(JSON.parse(line) as StreamEvent);
      }
      if (buffer.trim()) handle(JSON.parse(buffer) as StreamEvent);
      if (!finished) throw new Error("Fisher got cut off before finishing.");
    } catch (e) {
      const cut = abort.signal.aborted;
      setError(
        cut
          ? "Fisher stopped answering. Your connection may have dropped. Anything already listed above with a check mark is done."
          : e instanceof Error
            ? e.message
            : "Something went wrong.",
      );
      setMessages((m) => m.filter((x) => !(x.id === assistantId && !x.content)));
    } finally {
      window.clearTimeout(watchdog);
      setStatus(null);
      setBusy(false);
      router.refresh();
    }
  }

  const open = tasks.filter((t) => t.status === "waiting_on_owner");
  const working = tasks.filter((t) => t.status === "queued" || t.status === "running");

  return (
    <div data-tour="chat" className={cn("flex min-h-0 flex-col overflow-hidden rounded-lg border-t-4 border-night bg-white", className)}>
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <FisherAvatar size={36} />
          <div>
            <p className="text-sm font-semibold text-night">Fisher</p>
            <p className="text-sm text-muted-foreground">{agentReady ? "Your marketing helper" : "Chat isn't switched on yet"}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {working.length ? (
            <span className="mr-2 hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
              <Clock size={14} aria-hidden="true" />
              {working.length} in progress
            </span>
          ) : null}
          <Button size="sm" variant="ghost" className="h-9" aria-pressed={showChats} onClick={() => setShowChats((v) => !v)}>
            <History aria-hidden="true" />
            Chats
          </Button>
          <Button asChild size="sm" variant="outline" className="h-9">
            <Link href="/dashboard?chat=new" scroll={false}>
              <SquarePen aria-hidden="true" />
              New chat
            </Link>
          </Button>
        </div>
      </div>

      {showChats ? <ChatList chats={chats} current={convRef.current} onPick={() => setShowChats(false)} /> : null}

      <div className={cn("min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4", showChats && "hidden")}>
        {messages.map((m) =>
          m.role === "tool" && m.meta?.card ? (
            <WorkCard key={m.id} card={m.meta.card as ToolCard} />
          ) : m.role === "tool" ? (
            <div key={m.id} className="flex items-start gap-2 pl-1 text-sm text-muted-foreground">
              <Check size={14} className="mt-1 shrink-0 text-night" aria-hidden="true" />
              <span>{m.content}</span>
            </div>
          ) : (
            <div key={m.id} className={cn("flex items-end gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
              {m.role === "assistant" ? <FisherAvatar size={24} className="mb-0.5" /> : null}
              <div
                className={cn(
                  "max-w-[88%] rounded-lg px-3.5 py-2.5 text-sm whitespace-pre-wrap",
                  m.role === "user" ? "bg-night text-white" : "bg-surface text-ink",
                )}
              >
                {m.content}
                {m.pending && (status || !m.content) ? (
                  <span className={cn("block", m.content && "mt-2 border-t border-line pt-2")}>
                    <Working status={status} now={now} />
                  </span>
                ) : null}
              </div>
            </div>
          ),
        )}
        {error ? (
          <div role="alert" className="rounded-lg border border-destructive/30 bg-white p-3 text-sm">
            <p className="font-semibold text-destructive">That didn&apos;t finish.</p>
            <p className="mt-1">{error}</p>
            {lastAsk.current ? (
              <Button size="sm" variant="outline" className="mt-2" disabled={busy} onClick={() => void send(lastAsk.current!)}>
                Try again
              </Button>
            ) : null}
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {open.length ? (
        <div className="space-y-2 border-t border-line bg-surface px-4 py-3">
          <p className="text-sm font-semibold text-signal">Needs you</p>
          {open.map((t) => (
            <TaskCard key={t.id} task={t} userId={userId} onDone={(note) => send(note)} />
          ))}
        </div>
      ) : null}

      <div className="border-t border-line p-3">
        {messages.length <= 2 && !busy ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-night px-3 py-1 text-sm text-night transition-colors hover:bg-night hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal active:bg-night-tint active:text-white"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(draft);
          }}
          className="flex items-end gap-2"
        >
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(draft);
              }
            }}
            rows={1}
            placeholder={agentReady ? "Tell Fisher what's going on in the store…" : "Chat isn't on yet. Your plan already works."}
            disabled={busy || !agentReady}
            className="max-h-40 min-h-11 resize-none py-2.5 text-sm"
            aria-label="Message Fisher"
          />
          <Button type="submit" size="icon" variant="signal" disabled={busy || !draft.trim() || !agentReady} aria-label="Send">
            <ArrowUp aria-hidden="true" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function TaskCard({ task, userId, onDone }: { task: Task; userId: string; onDone: (note: string) => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function dismiss() {
    start(async () => {
      await dismissTask(task.id);
      router.refresh();
    });
  }

  if (task.kind === "send_text") {
    const p = task.payload as { phone: string; name?: string; body: string; purpose?: string };
    return (
      <div className="rounded-md border border-line bg-white p-3">
        <p className="text-sm font-semibold">
          Text to {p.name || formatPhone(p.phone)} <span className="font-normal text-muted-foreground">· {formatPhone(p.phone)}</span>
        </p>
        <p className="mt-1 rounded-md bg-surface px-3 py-2 text-sm whitespace-pre-wrap">{p.body}</p>
        {msg ? <p className="mt-2 text-sm text-muted-foreground">{msg}</p> : null}
        <div className="mt-2 flex gap-2">
          <Button
            size="sm"
            variant="signal"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await approveText(task.id);
                setMsg(r.message ?? null);
                router.refresh();
              })
            }
          >
            <Check aria-hidden="true" />
            Approve and send
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={dismiss}>
            <X aria-hidden="true" />
            Skip
          </Button>
        </div>
      </div>
    );
  }

  if (task.kind === "clips_request") {
    const p = task.payload as { count: number; why?: string };
    async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
      const files = Array.from(e.target.files ?? []).slice(0, 12);
      if (!files.length) return;
      setMsg(`Uploading ${files.length} ${files.length === 1 ? "file" : "files"}…`);
      const supabase = createClient();
      const paths: string[] = [];
      for (const f of files) {
        const path = `${userId}/${task.id}/${Date.now()}-${f.name.replace(/[^\w.-]+/g, "_")}`;
        const { error } = await supabase.storage.from("clips").upload(path, f, { upsert: false });
        if (error) {
          setMsg(`Upload failed: ${error.message}`);
          return;
        }
        paths.push(path);
      }
      start(async () => {
        const r = await clipsUploaded(task.id, paths);
        setMsg(r.message ?? null);
        router.refresh();
        if (r.ok) onDone(`I uploaded ${paths.length} photos and clips.`);
      });
    }
    return (
      <div className="rounded-md border border-line bg-white p-3">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Film size={16} aria-hidden="true" />
          {task.title}
        </p>
        {p.why ? <p className="mt-1 text-sm text-muted-foreground">{p.why}</p> : null}
        <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={onFiles} />
        {msg ? <p className="mt-2 text-sm text-muted-foreground">{msg}</p> : null}
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="signal" disabled={pending} onClick={() => fileRef.current?.click()}>
            <Upload aria-hidden="true" />
            Choose photos or clips
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={dismiss}>
            Not now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-line bg-white p-3 text-sm">
      <p className="font-semibold">{task.title}</p>
      <Button size="sm" variant="ghost" className="mt-2" disabled={pending} onClick={dismiss}>
        Dismiss
      </Button>
    </div>
  );
}

// What a specialist made: a draft to copy, or a poster to download.
function WorkCard({ card }: { card: ToolCard }) {
  const [copied, setCopied] = useState(false);
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  return (
    <div className="rounded-md border border-line bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-night">{card.kind === "poster" ? "Poster" : card.title}</p>
        <Button size="sm" variant="outline" onClick={() => copy(card.body)} className="h-9 shrink-0">
          <Copy aria-hidden="true" />
          {copied ? "Copied" : card.kind === "poster" ? "Copy caption" : "Copy"}
        </Button>
      </div>
      {card.kind === "poster" ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- drawn on our own server, per owner */}
          <img src={`/api/poster/${card.posterId}`} alt={`Poster: ${card.title}`} width={1080} height={1350} className="mt-2 h-auto w-full max-w-72 rounded-[4px] bg-surface" loading="lazy" />
          <Button asChild size="sm" variant="signal" className="mt-2 h-9">
            <a href={`/api/poster/${card.posterId}?download=1`} download>
              <Download aria-hidden="true" />
              Download poster
            </a>
          </Button>
          {card.body ? <p className="mt-2 text-sm whitespace-pre-wrap">{card.body}</p> : null}
        </>
      ) : (
        <p className="mt-2 max-h-96 overflow-y-auto text-sm whitespace-pre-wrap">{card.body}</p>
      )}
    </div>
  );
}

function whenLabel(iso: string) {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days < 1) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (days < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Past chats: open one, or delete it for good.
function ChatList({ chats, current, onPick }: { chats: ChatSummary[]; current: string | null; onPick: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    setError(null);
    start(async () => {
      const r = await deleteConversation(id);
      if (!r.ok) return setError(r.message ?? "Couldn't delete that chat.");
      if (id === current) router.push("/dashboard?chat=new", { scroll: false });
      else router.refresh();
    });
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
      <h3 className="px-2 py-1 text-sm font-semibold">Your chats</h3>
      {error ? (
        <p role="alert" className="px-2 text-sm text-signal-tint">
          {error}
        </p>
      ) : null}
      {chats.length ? (
        <ul className="mt-1 space-y-0.5">
          {chats.map((c) => (
            <li key={c.id} className={cn("flex items-center gap-1 rounded-md", c.id === current && "bg-surface")}>
              <Link
                href={`/dashboard?chat=${c.id}`}
                scroll={false}
                onClick={onPick}
                aria-current={c.id === current ? "true" : undefined}
                className="flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 rounded-md px-2 text-sm hover:bg-surface focus-visible:outline-2 focus-visible:outline-signal"
              >
                <span className="min-w-0 truncate">{c.title}</span>
                <span className="num shrink-0 text-muted-foreground">{whenLabel(c.updatedAt)}</span>
              </Link>
              <button
                type="button"
                disabled={pending}
                onClick={() => remove(c.id, c.title)}
                className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-signal-tint focus-visible:outline-2 focus-visible:outline-signal"
              >
                <Trash2 size={16} aria-hidden="true" />
                <span className="sr-only">Delete {c.title}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-2 py-2 text-sm text-muted-foreground">No saved chats yet. Each chat is saved after your first message.</p>
      )}
    </div>
  );
}

// The "Fisher is working" line in the pending bubble: what it's doing, how
// long it's been, and a heads-up when a job is the slow kind.
function Working({ status, now }: { status: { label: string; slow: boolean; since: number } | null; now: number }) {
  const label = status?.label ?? "Thinking";
  const secs = status ? Math.max(0, Math.floor((now - status.since) / 1000)) : 0;
  return (
    <span role="status" className="block">
      <span className="flex items-center gap-2">
        <span className="size-2 shrink-0 rounded-full bg-signal motion-safe:animate-pulse" aria-hidden="true" />
        <span>{label}…</span>
        {secs >= 3 ? <span className="num text-muted-foreground">{secs}s</span> : null}
      </span>
      {status?.slow && secs < 20 ? <span className="mt-1 block text-xs text-muted-foreground">This kind of job takes about a minute.</span> : null}
      {secs >= 20 ? <span className="mt-1 block text-xs text-muted-foreground">Still working. You can leave this open and keep using the page.</span> : null}
    </span>
  );
}

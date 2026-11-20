"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowUp, Check, Clock, Film, MessageSquareText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { approveText, clipsUploaded, dismissTask } from "@/lib/agent/actions";
import type { StreamEvent } from "@/lib/agent/run";
import type { Task } from "@/lib/agent/snapshot";
import type { ChatMessage } from "@/lib/agent/store";
import { formatPhone } from "@/lib/app/types";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Local = { id: string; role: "user" | "assistant" | "tool"; content: string; meta?: Record<string, unknown>; pending?: boolean };

// The consultant. A running conversation with the owner, with the work it
// needs from them (uploads, approvals) shown as cards above the composer.
export function Consultant({
  initialMessages,
  tasks,
  agentReady,
  intro,
  userId,
  suggestions,
  className,
}: {
  initialMessages: ChatMessage[];
  tasks: Task[];
  agentReady: boolean;
  intro: string;
  userId: string;
  suggestions: string[];
  className?: string;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Local[]>(() =>
    initialMessages.length ? initialMessages.map((m) => ({ id: m.id, role: m.role, content: m.content, meta: m.meta })) : [{ id: "intro", role: "assistant", content: intro }],
  );
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, tasks]);

  // First visit with a working brain: have the consultant open the conversation.
  useEffect(() => {
    if (agentReady && initialMessages.length === 0 && !startedRef.current) {
      startedRef.current = true;
      void send("Walk me through my plan.", { silentUser: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send(text: string, opts: { silentUser?: boolean } = {}) {
    const clean = text.trim();
    if (!clean || busy) return;
    setError(null);
    setBusy(true);
    setDraft("");
    const userId = `u-${Date.now()}`;
    const assistantId = `a-${Date.now()}`;
    setMessages((m) => [
      ...(opts.silentUser ? m.filter((x) => x.id !== "intro") : m),
      ...(opts.silentUser ? [] : [{ id: userId, role: "user" as const, content: clean }]),
      { id: assistantId, role: "assistant" as const, content: "", pending: true },
    ]);

    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: clean }) });
      if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({ error: "Could not reach the consultant." }))).error);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const handle = (ev: StreamEvent) => {
        if (ev.type === "text") {
          setMessages((m) => m.map((x) => (x.id === assistantId ? { ...x, content: x.content + ev.delta } : x)));
        } else if (ev.type === "tool") {
          setMessages((m) => {
            const i = m.findIndex((x) => x.id === assistantId);
            const chip: Local = { id: `t-${Date.now()}-${Math.random()}`, role: "tool", content: ev.summary, meta: { name: ev.name } };
            return [...m.slice(0, i), chip, ...m.slice(i)];
          });
        } else if (ev.type === "error") {
          setError(ev.message);
        } else if (ev.type === "done") {
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setMessages((m) => m.filter((x) => !(x.id === assistantId && !x.content)));
    } finally {
      setBusy(false);
      router.refresh();
    }
  }

  const open = tasks.filter((t) => t.status === "waiting_on_owner");
  const working = tasks.filter((t) => t.status === "queued" || t.status === "running");

  return (
    <div className={cn("flex min-h-0 flex-col rounded-lg border border-line bg-white", className)}>
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-night text-white">
            <MessageSquareText size={16} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold">Your consultant</p>
            <p className="text-sm text-muted-foreground">{agentReady ? "Explains the plan. Does the work when you say go." : "Waiting on the Claude key"}</p>
          </div>
        </div>
        {working.length ? (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock size={14} aria-hidden="true" />
            {working.length} in progress
          </span>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m) =>
          m.role === "tool" ? (
            <div key={m.id} className="flex items-start gap-2 pl-1 text-sm text-muted-foreground">
              <Check size={14} className="mt-1 shrink-0 text-night" aria-hidden="true" />
              <span>{m.content}</span>
            </div>
          ) : (
            <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[88%] rounded-lg px-3.5 py-2.5 text-sm whitespace-pre-wrap",
                  m.role === "user" ? "bg-night text-white" : "bg-surface text-ink",
                )}
              >
                {m.content || (m.pending ? <span className="inline-block animate-pulse">Thinking…</span> : "")}
              </div>
            </div>
          ),
        )}
        {error ? (
          <p role="alert" className="text-sm font-semibold text-destructive">
            {error}
          </p>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {open.length ? (
        <div className="space-y-2 border-t border-line bg-surface px-4 py-3">
          <p className="text-sm font-semibold">Needs you</p>
          {open.map((t) => (
            <TaskCard key={t.id} task={t} userId={userId} onDone={(note) => send(note)} />
          ))}
        </div>
      ) : null}

      <div className="border-t border-line p-3">
        {messages.length <= 2 && !busy ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-line px-3 py-1 text-sm hover:border-night">
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
            placeholder={agentReady ? "Tell your consultant what's going on…" : "Chat turns on once the Claude key is added"}
            disabled={busy || !agentReady}
            className="max-h-40 min-h-11 resize-none py-2.5 text-sm"
            aria-label="Message your consultant"
          />
          <Button type="submit" size="icon" disabled={busy || !draft.trim() || !agentReady} aria-label="Send">
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
      setMsg(`Uploading ${files.length} ${files.length === 1 ? "clip" : "clips"}…`);
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
        if (r.ok) onDone(`I uploaded ${paths.length} clips.`);
      });
    }
    return (
      <div className="rounded-md border border-line bg-white p-3">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Film size={16} aria-hidden="true" />
          {task.title}
        </p>
        {p.why ? <p className="mt-1 text-sm text-muted-foreground">{p.why}</p> : null}
        <input ref={fileRef} type="file" accept="video/*" multiple className="hidden" onChange={onFiles} />
        {msg ? <p className="mt-2 text-sm text-muted-foreground">{msg}</p> : null}
        <div className="mt-2 flex gap-2">
          <Button size="sm" disabled={pending} onClick={() => fileRef.current?.click()}>
            <Upload aria-hidden="true" />
            Choose clips
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

"use client";

import { useEffect, useOptimistic, useRef, useState } from "react";
import { SendIcon } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { markThreadRead, sendMessage } from "@/lib/actions/messages";
import { idle } from "@/lib/action-result";
import type { MessageRow } from "@/lib/supabase/database.types";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/forms/submit-button";
import { cn } from "@/lib/utils";

type Props = {
  threadId: string;
  userId: string;
  initialMessages: MessageRow[];
  otherName: string;
  disabled?: boolean;
  disabledReason?: string;
};

export function ThreadView({ threadId, userId, initialMessages, otherName, disabled, disabledReason }: Props) {
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [optimistic, addOptimistic] = useOptimistic(messages, (cur: MessageRow[], m: MessageRow) => [...cur, m]);
  const formRef = useRef<HTMLFormElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // live updates
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`thread:${threadId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `thread_id=eq.${threadId}` }, (payload) => {
        const m = payload.new as MessageRow;
        setMessages((cur) => (cur.some((x) => x.id === m.id) ? cur : [...cur, m]));
        if (m.sender_id !== userId) void markThreadRead(threadId);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, userId]);

  // mark read on open
  useEffect(() => {
    void markThreadRead(threadId);
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [optimistic.length]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-1 py-4">
        {optimistic.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No messages yet. Say hi and suggest a public place to meet, or confirm the wishlist order.
          </p>
        )}
        {optimistic.map((m, i) => {
          const mine = m.sender_id === userId;
          const prev = optimistic[i - 1];
          const grouped = prev && prev.sender_id === m.sender_id && new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < 5 * 60e3;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[80%]", grouped ? "mt-0" : "mt-2")}>
                {!grouped && (
                  <p className={cn("mb-1 text-[11px] text-muted-foreground", mine && "text-right")}>
                    {mine ? "You" : m.sender_id ? otherName : "Former neighbor"} ·{" "}
                    {new Date(m.created_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                  </p>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap",
                    mine ? "rounded-br-md bg-foreground text-background" : "rounded-bl-md border bg-card",
                    m.id.startsWith("tmp-") && "opacity-60",
                  )}
                >
                  {m.body}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {disabled ? (
        <p className="rounded-xl border bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground">{disabledReason}</p>
      ) : (
        <form
          ref={formRef}
          action={async (fd) => {
            const body = String(fd.get("body") ?? "").trim();
            if (!body) return;
            addOptimistic({ id: `tmp-${Date.now()}`, thread_id: threadId, sender_id: userId, body, created_at: new Date().toISOString() });
            formRef.current?.reset();
            const result = await sendMessage(idle, fd);
            if (result.ok && result.data) {
              const m = result.data;
              setMessages((cur) => (cur.some((x) => x.id === m.id) ? cur : [...cur, m]));
            } else if (!result.ok) {
              toast.error(result.error ?? "Couldn't send that.");
              if (textRef.current) textRef.current.value = body;
            }
          }}
          className="sticky bottom-0 flex items-end gap-2 border-t bg-background pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]"
        >
          <input type="hidden" name="threadId" value={threadId} />
          <Textarea
            ref={textRef}
            name="body"
            rows={1}
            maxLength={2000}
            placeholder="Write a message…"
            aria-label="Message"
            required
            className="max-h-40 min-h-10 flex-1 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
          />
          <SubmitButton size="icon-lg" aria-label="Send">
            <SendIcon />
          </SubmitButton>
        </form>
      )}
    </div>
  );
}

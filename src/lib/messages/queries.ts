import "server-only";
import { createClient } from "@/lib/supabase/server";
import { publicUrl } from "@/lib/storage";
import type { MessageRow, PublicProfileRow, ThreadRow } from "@/lib/supabase/database.types";

export type ThreadSummary = {
  id: string;
  needId: string;
  needTitle: string;
  needStatus: string;
  other: { id: string | null; displayName: string; avatarUrl: string | null };
  lastMessage: { body: string; createdAt: string; mine: boolean } | null;
  lastMessageAt: string;
  unread: boolean;
  role: "poster" | "helper";
};

export async function fetchThreads(userId: string): Promise<ThreadSummary[]> {
  const supabase = await createClient();
  const { data: threads } = await supabase
    .from("threads")
    .select("*")
    .or(`poster_id.eq.${userId},helper_id.eq.${userId}`)
    .order("last_message_at", { ascending: false })
    .limit(100);
  if (!threads?.length) return [];

  const needIds = threads.map((t) => t.need_id);
  const otherIds = Array.from(new Set(threads.map((t) => (t.poster_id === userId ? t.helper_id : t.poster_id)).filter(Boolean))) as string[];
  const threadIds = threads.map((t) => t.id);

  const [{ data: needs }, { data: people }, { data: reads }, { data: lastMessages }] = await Promise.all([
    supabase.from("needs").select("id, title, status").in("id", needIds),
    otherIds.length ? supabase.from("public_profiles").select("*").in("id", otherIds) : Promise.resolve({ data: [] as PublicProfileRow[] }),
    supabase.from("thread_reads").select("*").eq("user_id", userId).in("thread_id", threadIds),
    // newest message per thread; cheap enough at this scale
    supabase.from("messages").select("*").in("thread_id", threadIds).order("created_at", { ascending: false }).limit(400),
  ]);

  const needById = new Map((needs ?? []).map((n) => [n.id, n]));
  const personById = new Map((people ?? []).map((p) => [p.id, p]));
  const readById = new Map((reads ?? []).map((r) => [r.thread_id, r.last_read_at]));
  const lastByThread = new Map<string, MessageRow>();
  for (const m of lastMessages ?? []) if (!lastByThread.has(m.thread_id)) lastByThread.set(m.thread_id, m);

  return threads.map((t) => summarize(t, userId, needById.get(t.need_id), personById, readById.get(t.id), lastByThread.get(t.id)));
}

function summarize(
  t: ThreadRow,
  userId: string,
  need: { title: string; status: string } | undefined,
  people: Map<string, PublicProfileRow>,
  lastReadAt: string | undefined,
  last: MessageRow | undefined,
): ThreadSummary {
  const otherId = t.poster_id === userId ? t.helper_id : t.poster_id;
  const other = otherId ? people.get(otherId) : undefined;
  const lastAt = last?.created_at ?? t.last_message_at;
  return {
    id: t.id,
    needId: t.need_id,
    needTitle: need?.title ?? "A need",
    needStatus: need?.status ?? "closed",
    other: {
      id: otherId,
      displayName: other?.display_name ?? "A former neighbor",
      avatarUrl: publicUrl("avatars", other?.avatar_url),
    },
    lastMessage: last ? { body: last.body, createdAt: last.created_at, mine: last.sender_id === userId } : null,
    lastMessageAt: lastAt,
    unread: !!last && last.sender_id !== userId && (!lastReadAt || new Date(lastReadAt) < new Date(last.created_at)),
    role: t.poster_id === userId ? "poster" : "helper",
  };
}

export async function fetchThread(threadId: string, userId: string) {
  const supabase = await createClient();
  const { data: thread } = await supabase.from("threads").select("*").eq("id", threadId).maybeSingle();
  if (!thread) return null;
  const otherId = thread.poster_id === userId ? thread.helper_id : thread.poster_id;
  const [{ data: need }, { data: other }, { data: messages }] = await Promise.all([
    supabase.from("needs").select("*").eq("id", thread.need_id).maybeSingle(),
    otherId ? supabase.from("public_profiles").select("*").eq("id", otherId).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("messages").select("*").eq("thread_id", threadId).order("created_at", { ascending: true }).limit(500),
  ]);
  return {
    thread,
    need,
    other: other
      ? { id: other.id, displayName: other.display_name, avatarUrl: publicUrl("avatars", other.avatar_url), area: other.area }
      : null,
    messages: messages ?? [],
    role: (thread.poster_id === userId ? "poster" : "helper") as "poster" | "helper",
  };
}

export async function unreadCounts(userId: string) {
  const supabase = await createClient();
  const { count: notifications } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);
  return { notifications: notifications ?? 0 };
}

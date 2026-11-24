import type { SupabaseClient } from "@supabase/supabase-js";
import type { Task } from "./snapshot";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  meta: Record<string, unknown>;
  createdAt: string;
};

export type ChatSummary = { id: string; title: string; updatedAt: string };

/** The owner's chats, newest first. */
export async function listConversations(supabase: SupabaseClient, businessId: string): Promise<ChatSummary[]> {
  const { data } = await supabase.from("conversations").select("id, title, updated_at").eq("business_id", businessId).order("updated_at", { ascending: false }).limit(40);
  return (data ?? []).map((c) => ({ id: c.id as string, title: (c.title as string) || "New chat", updatedAt: c.updated_at as string }));
}

/** One chat's messages, plus its history for the model. Returns null if it isn't this store's. */
export async function loadConversation(supabase: SupabaseClient, businessId: string, conversationId: string) {
  const { data: convo } = await supabase.from("conversations").select("id").eq("id", conversationId).eq("business_id", businessId).maybeSingle();
  if (!convo) return null;
  const { data: rows } = await supabase
    .from("chat_messages")
    .select("id, role, content, meta, created_at")
    .eq("conversation_id", convo.id)
    .order("created_at")
    .limit(200);
  const messages: ChatMessage[] = (rows ?? []).map((r) => ({ id: r.id, role: r.role, content: r.content, meta: (r.meta as Record<string, unknown>) ?? {}, createdAt: r.created_at }));
  const history = messages.filter((m) => m.role !== "tool" && m.content).map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  return { conversationId: convo.id as string, messages, history };
}

/** Starts a chat, named after its first message. */
export async function createConversation(supabase: SupabaseClient, ownerId: string, businessId: string, firstMessage: string) {
  const title = firstMessage.replace(/\s+/g, " ").trim().slice(0, 60);
  const { data, error } = await supabase.from("conversations").insert({ business_id: businessId, owner_id: ownerId, title }).select("id").single();
  if (error) throw error;
  return data.id as string;
}

/** Marks a chat as just used, so it moves to the top of the list. */
export async function touchConversation(supabase: SupabaseClient, conversationId: string) {
  await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
}

export async function getOpenTasks(supabase: SupabaseClient, businessId: string): Promise<Task[]> {
  const { data } = await supabase
    .from("agent_tasks")
    .select("*")
    .eq("business_id", businessId)
    .in("status", ["waiting_on_owner", "queued", "running"])
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []).map((t) => ({
    id: t.id,
    kind: t.kind,
    status: t.status,
    title: t.title,
    payload: (t.payload as Record<string, unknown>) ?? {},
    result: (t.result as Record<string, unknown>) ?? {},
    createdAt: t.created_at,
  }));
}

/** A first message when the owner arrives and the consultant hasn't spoken yet. Used only when Claude isn't connected. */
export function fallbackIntro(hasPlan: boolean, totalMonthly: number, firstStep?: string) {
  if (!hasPlan) return "Hi, I'm Fisher, your marketing helper. Grade your store first (six questions, about 2 minutes) and I'll come back with your fixes, biggest first. Then we work on them together.";
  return `Hi, I'm Fisher, your marketing helper. Your fixes could bring in about $${totalMonthly.toLocaleString()} a month, and "${firstStep ?? "the first fix"}" is where we start. Send me a few product photos when you're ready and I'll turn them into your first week of posts.`;
}

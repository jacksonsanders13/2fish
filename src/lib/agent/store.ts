import type { SupabaseClient } from "@supabase/supabase-js";
import type { Task } from "./snapshot";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  meta: Record<string, unknown>;
  createdAt: string;
};

/** The one running conversation for this business, plus its history for the model. */
export async function getOrCreateConversation(supabase: SupabaseClient, ownerId: string, businessId: string) {
  let { data: convo } = await supabase
    .from("conversations")
    .select("id")
    .eq("business_id", businessId)
    .order("created_at")
    .limit(1)
    .maybeSingle();
  if (!convo) {
    const made = await supabase.from("conversations").insert({ business_id: businessId, owner_id: ownerId }).select("id").single();
    if (made.data) convo = made.data;
    else {
      const again = await supabase.from("conversations").select("id").eq("business_id", businessId).order("created_at").limit(1).single();
      convo = again.data!;
    }
  }
  const { data: rows } = await supabase
    .from("chat_messages")
    .select("id, role, content, meta, created_at")
    .eq("conversation_id", convo.id)
    .order("created_at")
    .limit(200);
  const messages: ChatMessage[] = (rows ?? []).map((r) => ({ id: r.id, role: r.role, content: r.content, meta: (r.meta as Record<string, unknown>) ?? {}, createdAt: r.created_at }));
  const history = messages.filter((m) => m.role !== "tool" && m.content).map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  return { conversationId: convo.id, messages, history };
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
  if (!hasPlan) return "Hi, I'm Fisher, your 2fish helper. Grade your store first (six questions, about 2 minutes) and I'll come back with your fixes, biggest first. Then we work on them together.";
  return `Hi, I'm Fisher, your 2fish helper. Your fixes could bring in about $${totalMonthly.toLocaleString()} a month, and "${firstStep ?? "the first fix"}" is where we start. Send me a few product photos when you're ready and I'll turn them into your first week of posts.`;
}

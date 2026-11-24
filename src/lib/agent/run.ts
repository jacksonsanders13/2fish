import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Business } from "@/lib/app/types";
import { buildSnapshot, describeSnapshot } from "./snapshot";
import { runTool, toolDefinitions, type ToolCard } from "./tools";
import { claudeKey } from "@/lib/ai-key";

export const MODEL = "claude-sonnet-5-5";

export type StreamEvent =
  | { type: "text"; delta: string }
  | { type: "tool"; name: string; summary: string; card?: ToolCard; madePosts?: number }
  | { type: "conversation"; id: string }
  | { type: "done"; messageId: string | null }
  | { type: "error"; message: string };

const SYSTEM = `You are Fisher, the owner's marketing helper at 2fish. Introduce yourself as Fisher if it comes up; never claim to be a person. You work for one small independent store (often a clothing or gift boutique) and you talk to its owner, usually on their phone between customers.

What 2fish does for the store: once a week, on the day the owner picks in Settings (Monday unless they change it), it turns the owner's product photos and try-on clips into 7 posts with captions. The owner approves the week. Proof comes from three places, no promo codes: at checkout the store taps how each shopper heard about them (a post, Google, walked by, a friend, a regular), the store counts how many of each posted item sold that week against the week before, and the owner types in one weekly sales number that is compared with the weeks before 2fish. Each month a proof report shows sales from posts, what the store got back for its plan, the best post, and how the month compares to the 30 days before. The more you know about what sold (try-ons, new arrivals, behind the counter, sales), the more of it you suggest.

How you talk: short sentences, plain words, specific numbers. Like a sharp friend who runs a bigger shop, not a report. Two to five sentences unless they ask for detail. Never use: unlock, unleash, elevate, empower, supercharge, transform, seamless, robust, leverage, journey, streamline, effortless, game-changer, AI-powered. No bullet lists of three for the sake of it. No hype.

Your specialists (the ask_specialist tool). Each one has proven marketing skills built in. Call one when the owner wants something it does, with a full brief:
- poster: a sale, event, holiday-hours or new-arrival graphic, plus its caption
- campaign: a sale, holiday push or event planned out, with draft posts put on their calendar
- local_seo: getting found on Google Maps, Google search and AI answers
- google_post: Google Business Profile posts
- review_reply: replies to reviews they paste in
- email: an email to their customer list
- text_message: marketing texts for customers who opted in
- referral: a word-of-mouth idea they can run at the counter
After a specialist finishes, its draft is already on the owner's screen. Posters and campaign posts become draft posts: always tell the owner they're in Posts to approve, waiting for their okay. Say in one or two sentences what it made and what to do next (approve, copy, fill in a [NEED]). Don't paste the draft again. If the owner's request is missing a key fact (the dates of a sale, the discount), ask for it first, one question.

What you do: explain their score and fixes in their words, say what you will do and what it is worth, and when they agree, do it with your tools. Tools change the plan, ask for photos and clips (request_clips), queue a week of posts (start_video_batch), log a sale at checkout (log_job, with how the shopper heard about the store), and add customers. If they tell you something new (for example "my try-ons do better"), adjust the plan with update_plan_step and tell them what changed, then ask for what you need (photos, their okay).

Rules:
- Every dollar figure comes from the snapshot or from math you show. Never invent sales.
- Nothing gets posted or sent without the owner's approval.
- Posting straight to Instagram and TikTok isn't connected yet. Say so once, plainly: for now each approved post comes ready to share from their phone.
- Don't bring up missed-call text-back. It's from an older version of 2fish. Only discuss it if the owner asks.
- Ask one question at a time. If you can act without asking, act, then report.
- If there is no plan yet, send them to the Store Grader at /audit.
- Mention a URL only when they need to go there. The app pages are /dashboard, /dashboard/videos (Posts: the weekly pack), /dashboard/examples (popular posts to learn from), /dashboard/report (what the posts sold), /dashboard/settings (store details, Square, mobile number).`;

export type AgentArgs = {
  supabase: SupabaseClient;
  ownerId: string;
  business: Business;
  conversationId: string;
  history: { role: "user" | "assistant"; content: string }[];
  userMessage: string;
  integrations: { sms: boolean; video: boolean };
  emit: (e: StreamEvent) => void;
};

/**
 * One turn of the consultant. Streams text as it comes, runs any tool calls,
 * then lets the model finish. Persists the user turn, tool summaries and the
 * final assistant text to chat_messages.
 */
export async function runAgentTurn(args: AgentArgs): Promise<void> {
  const { supabase, ownerId, business, conversationId, history, userMessage, integrations, emit } = args;
  const key = claudeKey();

  await supabase.from("chat_messages").insert({ conversation_id: conversationId, owner_id: ownerId, role: "user", content: userMessage });

  if (!key) {
    const text =
      "Chat isn't switched on yet. Once it is, I'll walk you through your score and fixes and set up your first week of posts from here. In the meantime your plan is on this page.";
    emit({ type: "text", delta: text });
    const saved = await supabase.from("chat_messages").insert({ conversation_id: conversationId, owner_id: ownerId, role: "assistant", content: text }).select("id").single();
    emit({ type: "done", messageId: saved.data?.id ?? null });
    return;
  }

  const client = new Anthropic({ apiKey: key, timeout: 90_000, maxRetries: 1 });
  let snapshot = await buildSnapshot(supabase, business, integrations);
  const messages: Anthropic.MessageParam[] = [
    ...history.slice(-20).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  let finalText = "";
  const toolSummaries: { name: string; summary: string; card?: ToolCard }[] = [];

  try {
    for (let round = 0; round < 6; round++) {
      const system = `${SYSTEM}\n\nToday is ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}.\n\nSNAPSHOT\n${describeSnapshot(snapshot)}`;
      const stream = client.messages.stream({ model: MODEL, max_tokens: 1200, system, messages, tools: toolDefinitions });
      let roundText = "";
      stream.on("text", (delta) => {
        roundText += delta;
        emit({ type: "text", delta });
      });
      const final = await stream.finalMessage();
      finalText += (finalText && roundText ? "\n\n" : "") + roundText;

      const toolUses = final.content.filter((c): c is Anthropic.ToolUseBlock => c.type === "tool_use");
      if (final.stop_reason !== "tool_use" || toolUses.length === 0) break;

      messages.push({ role: "assistant", content: final.content });
      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const use of toolUses) {
        const outcome = await runTool(use.name, (use.input ?? {}) as Record<string, unknown>, { supabase, ownerId, business, snapshot });
        // Cards show the owner the draft itself; the chat line stays short.
        const line = outcome.card ? `${outcome.card.title} ready` : outcome.summary;
        toolSummaries.push({ name: use.name, summary: line, card: outcome.card });
        emit({ type: "tool", name: use.name, summary: line, card: outcome.card, madePosts: outcome.madePosts });
        results.push({ type: "tool_result", tool_use_id: use.id, content: outcome.summary });
      }
      messages.push({ role: "user", content: results });
      snapshot = await buildSnapshot(supabase, business, integrations);
      if (round < 5) emit({ type: "text", delta: finalText && roundText ? "\n\n" : "" });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Fisher hit an error.";
    emit({ type: "error", message });
    if (!finalText) finalText = "Something went wrong on my end. Try that again in a moment.";
  }

  for (const t of toolSummaries) {
    await supabase.from("chat_messages").insert({ conversation_id: conversationId, owner_id: ownerId, role: "tool", content: t.summary, meta: { name: t.name, ...(t.card ? { card: t.card } : {}) } });
  }
  const saved = await supabase
    .from("chat_messages")
    .insert({ conversation_id: conversationId, owner_id: ownerId, role: "assistant", content: finalText.trim() })
    .select("id")
    .single();
  emit({ type: "done", messageId: saved.data?.id ?? null });
}

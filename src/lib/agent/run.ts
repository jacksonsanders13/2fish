import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Business } from "@/lib/app/types";
import { buildSnapshot, describeSnapshot } from "./snapshot";
import { runTool, toolDefinitions } from "./tools";

export const MODEL = "claude-sonnet-5-5";

export type StreamEvent =
  | { type: "text"; delta: string }
  | { type: "tool"; name: string; summary: string }
  | { type: "done"; messageId: string | null }
  | { type: "error"; message: string };

const SYSTEM = `You are the owner's growth consultant at 2fish. You work for one small local business and you talk to its owner, usually on their phone between jobs.

How you talk: short sentences, plain words, specific numbers. Like a sharp friend who runs a bigger shop, not a report. Two to five sentences unless they ask for detail. Never use: unlock, unleash, elevate, empower, supercharge, transform, seamless, robust, leverage, journey, streamline, effortless, game-changer, AI-powered. No bullet lists of three for the sake of it. No hype.

What you do: explain the plan in their words, say what you will do and what it is worth, and when they agree, do it with your tools. Tools change the plan, turn text-back on, ask for clips, queue video batches, draft texts, log jobs, add customers. If they tell you something new (for example "I'm not posting enough"), adjust the plan with update_plan_step and tell them what changed, then ask for what you need (clips, a phone number, their okay).

Rules:
- Every dollar figure comes from the snapshot or from math you show. Never invent revenue.
- Nothing reaches a customer without the owner's approval. Use propose_text; never claim a text was sent.
- If texting or the video renderer is not connected, say so once, plainly, and still queue the work.
- Ask one question at a time. If you can act without asking, act, then report.
- If there is no plan yet, get them to the audit at /audit.
- Mention a URL only when they need to go there. The app pages are /dashboard, /dashboard/text-back, /dashboard/customers, /dashboard/settings.`;

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
  const key = process.env.ANTHROPIC_API_KEY;

  await supabase.from("chat_messages").insert({ conversation_id: conversationId, owner_id: ownerId, role: "user", content: userMessage });

  if (!key) {
    const text =
      "I can't think yet. The Claude API key isn't connected to this site. Once it is, I'll walk you through your plan and do the work from here. In the meantime the plan and the text-back setup still work from the menu.";
    emit({ type: "text", delta: text });
    const saved = await supabase.from("chat_messages").insert({ conversation_id: conversationId, owner_id: ownerId, role: "assistant", content: text }).select("id").single();
    emit({ type: "done", messageId: saved.data?.id ?? null });
    return;
  }

  const client = new Anthropic({ apiKey: key });
  let snapshot = await buildSnapshot(supabase, business, integrations);
  const messages: Anthropic.MessageParam[] = [
    ...history.slice(-20).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  let finalText = "";
  const toolSummaries: { name: string; summary: string }[] = [];

  try {
    for (let round = 0; round < 6; round++) {
      const system = `${SYSTEM}\n\nToday is ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}.\n\nSNAPSHOT\n${describeSnapshot(snapshot)}`;
      const stream = client.messages.stream({ model: MODEL, max_tokens: 900, system, messages, tools: toolDefinitions });
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
        toolSummaries.push({ name: use.name, summary: outcome.summary });
        emit({ type: "tool", name: use.name, summary: outcome.summary });
        results.push({ type: "tool_result", tool_use_id: use.id, content: outcome.summary });
      }
      messages.push({ role: "user", content: results });
      snapshot = await buildSnapshot(supabase, business, integrations);
      if (round < 5) emit({ type: "text", delta: finalText && roundText ? "\n\n" : "" });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "The consultant hit an error.";
    emit({ type: "error", message });
    if (!finalText) finalText = "Something went wrong on my end. Try that again in a moment.";
  }

  for (const t of toolSummaries) {
    await supabase.from("chat_messages").insert({ conversation_id: conversationId, owner_id: ownerId, role: "tool", content: t.summary, meta: { name: t.name } });
  }
  const saved = await supabase
    .from("chat_messages")
    .insert({ conversation_id: conversationId, owner_id: ownerId, role: "assistant", content: finalText.trim() })
    .select("id")
    .single();
  emit({ type: "done", messageId: saved.data?.id ?? null });
}

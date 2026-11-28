import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { limitMessage, takeQuota } from "@/lib/app/limits";
import { ensureBusiness } from "@/lib/app/queries";
import { createConversation, loadConversation, touchConversation } from "@/lib/agent/store";
import { runAgentTurn, type StreamEvent } from "@/lib/agent/run";
import { smsConfigured } from "@/lib/integrations/sms";
import { videoConfigured } from "@/lib/integrations/video";

// Big jobs (a sale plan with a week of posts) take Fisher over a minute.
export const maxDuration = 300;

// One chat turn. Streams newline-delimited JSON events back to the browser.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = z.object({ message: z.string().trim().min(1).max(4000), conversationId: z.string().uuid().nullish() }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Say something first." }, { status: 400 });

  let ctx;
  try {
    ctx = await ensureBusiness();
  } catch {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  const { supabase, user, business } = ctx;
  if (!(await takeQuota(supabase, "chat"))) return NextResponse.json({ error: limitMessage.chat }, { status: 429 });
  // Keep going in the chat the owner has open, or start a new one named after this message.
  const existing = parsed.data.conversationId ? await loadConversation(supabase, business.id, parsed.data.conversationId) : null;
  let conversationId: string;
  try {
    conversationId = existing?.conversationId ?? (await createConversation(supabase, user.id, business.id, parsed.data.message));
  } catch {
    return NextResponse.json({ error: "Couldn't start a chat. Try again." }, { status: 500 });
  }
  const history = existing?.history ?? [];
  const isNew = !existing;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (e: StreamEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      if (isNew) emit({ type: "conversation", id: conversationId });
      try {
        await runAgentTurn({
          supabase,
          ownerId: user.id,
          business,
          conversationId,
          history,
          userMessage: parsed.data.message,
          integrations: { sms: smsConfigured(), video: videoConfigured() },
          emit,
        });
      } catch (e) {
        emit({ type: "error", message: e instanceof Error ? e.message : "Something went wrong." });
        emit({ type: "done", messageId: null });
      } finally {
        await touchConversation(supabase, conversationId);
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" } });
}

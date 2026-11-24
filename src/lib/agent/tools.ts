import type Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import { startVideoJob } from "@/lib/integrations/video";
import { defaultTemplate, normalizePhone, type Business } from "@/lib/app/types";
import type { Snapshot } from "./snapshot";
import { runSpecialist, SPECIALIST_NAMES, SPECIALISTS } from "./specialists";

// What the consultant is allowed to do. Every tool runs with the owner's own
// Supabase session, so row-level security still applies. Anything that reaches
// a customer becomes a task the owner approves first.

export type ToolContext = { supabase: SupabaseClient; ownerId: string; business: Business; snapshot: Snapshot };
/** A card shown in the chat: a draft to read and copy, or a poster to download. */
export type ToolCard = { kind: "draft"; title: string; body: string } | { kind: "poster"; posterId: string; title: string; body: string };
export type ToolOutcome = { summary: string; data?: Record<string, unknown>; card?: ToolCard };

export const toolDefinitions: Anthropic.Tool[] = [
  {
    name: "ask_specialist",
    description:
      "Hand one job to a specialist with marketing skills built in. Use it when the owner wants: a poster or sale graphic (poster), a sale, holiday or event plan with posts on the calendar (campaign), help getting found on Google Maps and search (local_seo), Google Business Profile posts (google_post), replies to reviews they paste in (review_reply), an email to their customers (email), marketing texts (text_message), or a referral idea (referral). The draft shows up in the chat as a card. Write a full brief: what the owner asked for, every fact they gave (items, dates, prices, offer, hours, address, review text) and the goal. One specialist per call.",
    input_schema: {
      type: "object",
      properties: {
        specialist: { type: "string", enum: SPECIALIST_NAMES, description: Object.entries(SPECIALISTS).map(([k, v]) => `${k}: ${v.label}`).join("; ") },
        brief: { type: "string", description: "Everything the specialist needs, in plain words. Include every fact the owner gave; the specialist sees nothing else except the store snapshot." },
      },
      required: ["specialist", "brief"],
    },
  },
  {
    name: "update_plan_step",
    description:
      "Change one step of the plan: its status, wording, estimated monthly impact, or settings such as videos_per_week. Use when the owner agrees to a change or asks for one.",
    input_schema: {
      type: "object",
      properties: {
        key: { type: "string", description: "Step key: posts, proof, reviews, instagram, or a custom key." },
        status: { type: "string", enum: ["not-started", "needs-you", "in-progress", "live", "done"] },
        title: { type: "string" },
        detail: { type: "string", description: "One or two plain sentences." },
        impact_monthly: { type: "integer" },
        settings: { type: "object", description: "Free-form settings, e.g. {\"videos_per_week\": 15}." },
      },
      required: ["key"],
    },
  },
  {
    name: "add_plan_step",
    description: "Add a new step to the plan when the owner raises a leak the plan doesn't cover.",
    input_schema: {
      type: "object",
      properties: {
        key: { type: "string" },
        title: { type: "string" },
        detail: { type: "string" },
        impact_monthly: { type: "integer" },
      },
      required: ["key", "title", "detail", "impact_monthly"],
    },
  },
  {
    name: "set_textback",
    description: "Turn missed-call text-back on or off, or change its first message and hours. Turning it on makes the step live.",
    input_schema: {
      type: "object",
      properties: {
        enabled: { type: "boolean" },
        template: { type: "string", description: "The first text a missed caller receives. Under 320 characters." },
        hours_start: { type: "integer", minimum: 0, maximum: 23 },
        hours_end: { type: "integer", minimum: 1, maximum: 24 },
      },
    },
  },
  {
    name: "request_clips",
    description: "Ask the owner to upload product photos and short phone clips (new arrivals, try-ons, the shop floor). Shows an upload card in the chat. Use before starting a week of posts when there's nothing uploaded.",
    input_schema: {
      type: "object",
      properties: {
        count: { type: "integer", description: "How many photos or clips you'd like, usually 5 to 10." },
        why: { type: "string", description: "One sentence on what you'll make from them." },
      },
      required: ["count", "why"],
    },
  },
  {
    name: "start_video_batch",
    description: "Queue a week of posts (short vertical videos and photo posts, each tagged with the items it shows) from what the owner uploaded. Runs through the video renderer when connected; otherwise it is queued.",
    input_schema: {
      type: "object",
      properties: {
        videos_per_week: { type: "integer", minimum: 1, maximum: 21 },
        style: { type: "string", description: "Short notes: before/after, captions, pace." },
      },
      required: ["videos_per_week"],
    },
  },
  {
    name: "propose_text",
    description:
      "Draft a text message to a customer or caller for the owner to approve. Nothing is sent until they tap Approve. Use for replies, review requests and win-back messages.",
    input_schema: {
      type: "object",
      properties: {
        to_phone: { type: "string" },
        to_name: { type: "string" },
        body: { type: "string", description: "The exact message. Plain, short, signed with the business name." },
        purpose: { type: "string", enum: ["reply", "review-request", "win-back", "other"] },
      },
      required: ["to_phone", "body", "purpose"],
    },
  },
  {
    name: "log_job",
    description: "Log a sale at checkout the owner tells you about, with how the shopper heard about the store. Sales where heard_from is 'post' count as tracked sales.",
    input_schema: {
      type: "object",
      properties: {
        value: { type: "integer", minimum: 1, description: "Sale total in dollars." },
        heard_from: { type: "string", enum: ["post", "google", "walked-by", "friend", "regular", "other"] },
        note: { type: "string" },
      },
      required: ["value", "heard_from"],
    },
  },
  {
    name: "add_customer",
    description: "Add a customer to the owner's list.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        last_job_value: { type: "integer" },
      },
      required: ["name"],
    },
  },
];

export async function runTool(name: string, input: Record<string, unknown>, ctx: ToolContext): Promise<ToolOutcome> {
  const { supabase, ownerId, business, snapshot } = ctx;
  const planId = snapshot.plan?.id;
  const event = (kind: string, text: string) => supabase.from("events").insert({ business_id: business.id, owner_id: ownerId, kind, text });

  switch (name) {
    case "ask_specialist":
      return runSpecialist(String(input.specialist), String(input.brief ?? "").slice(0, 6000), ctx);

    case "update_plan_step": {
      if (!planId) return { summary: "There is no plan yet, so nothing to update." };
      const key = String(input.key);
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (typeof input.status === "string") patch.status = input.status;
      if (typeof input.title === "string") patch.title = input.title;
      if (typeof input.detail === "string") patch.detail = input.detail;
      if (typeof input.impact_monthly === "number") patch.impact_monthly = input.impact_monthly;
      const step = snapshot.plan?.steps.find((s) => s.key === key);
      if (!step) return { summary: `No step with key ${key}. Existing keys: ${snapshot.plan?.steps.map((s) => s.key).join(", ")}.` };
      if (input.settings && typeof input.settings === "object") patch.settings = { ...step.settings, ...(input.settings as Record<string, unknown>) };
      const { error } = await supabase.from("plan_steps").update(patch).eq("id", step.id);
      if (error) return { summary: `Could not update the step: ${error.message}` };
      await event("plan", `Plan updated: ${step.title}${patch.status ? ` is now ${patch.status}` : ""}${patch.settings ? ` (${JSON.stringify(patch.settings)})` : ""}.`);
      return { summary: `Updated step "${step.title}".`, data: patch };
    }

    case "add_plan_step": {
      if (!planId) return { summary: "There is no plan yet." };
      const rank = (snapshot.plan?.steps.length ?? 0) + 1;
      const { error } = await supabase.from("plan_steps").insert({
        plan_id: planId,
        owner_id: ownerId,
        rank,
        key: String(input.key),
        title: String(input.title),
        detail: String(input.detail),
        impact_monthly: Number(input.impact_monthly) || 0,
        status: "not-started",
        href: "/dashboard",
      });
      if (error) return { summary: `Could not add the step: ${error.message}` };
      await event("plan", `New plan step: ${String(input.title)}.`);
      return { summary: `Added step ${rank}: ${String(input.title)}.` };
    }

    case "set_textback": {
      const current = snapshot.textback;
      const row = {
        business_id: business.id,
        owner_id: ownerId,
        enabled: typeof input.enabled === "boolean" ? input.enabled : (current?.enabled ?? false),
        template: typeof input.template === "string" ? input.template.slice(0, 320) : current?.template || defaultTemplate(business.name),
        hours_start: typeof input.hours_start === "number" ? input.hours_start : (current?.hoursStart ?? 8),
        hours_end: typeof input.hours_end === "number" ? input.hours_end : (current?.hoursEnd ?? 21),
        forward_number: business.phone,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("textback_settings").upsert(row);
      if (error) return { summary: `Could not save text-back: ${error.message}` };
      if (typeof input.enabled === "boolean" && planId) {
        await supabase.from("plan_steps").update({ status: input.enabled ? "live" : "needs-you" }).eq("plan_id", planId).eq("key", "text-back");
      }
      await event("setting", row.enabled ? "Missed-call text-back turned on by Fisher." : "Text-back settings updated by Fisher.");
      return {
        summary: `Text-back is ${row.enabled ? "on" : "off"}. First message: "${row.template}". Hours ${row.hours_start}:00 to ${row.hours_end}:00.${snapshot.integrations.sms ? "" : " Texting is not connected yet, so messages queue until it is."}`,
      };
    }

    case "request_clips": {
      const count = Math.min(Math.max(Number(input.count) || 5, 1), 12);
      const { data, error } = await supabase
        .from("agent_tasks")
        .insert({
          business_id: business.id,
          owner_id: ownerId,
          kind: "clips_request",
          status: "waiting_on_owner",
          title: `Upload ${count} phone clips`,
          payload: { count, why: String(input.why ?? "") },
        })
        .select("id")
        .single();
      if (error) return { summary: `Could not create the upload request: ${error.message}` };
      return { summary: `An upload card for ${count} clips is now in the chat. Wait for the owner to upload before starting a batch.`, data: { task_id: data.id } };
    }

    case "start_video_batch": {
      const perWeek = Math.min(Math.max(Number(input.videos_per_week) || 7, 1), 21);
      const clips = await supabase
        .from("agent_tasks")
        .select("result")
        .eq("business_id", business.id)
        .eq("kind", "clips_request")
        .eq("status", "done")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const paths = ((clips.data?.result as { paths?: string[] } | null)?.paths ?? []) as string[];
      if (paths.length === 0) return { summary: "No clips uploaded yet. Use request_clips first and wait for the owner." };
      const task = await supabase
        .from("agent_tasks")
        .insert({
          business_id: business.id,
          owner_id: ownerId,
          kind: "video_batch",
          status: "queued",
          title: `${perWeek} videos from ${paths.length} clips`,
          payload: { videos_per_week: perWeek, style: String(input.style ?? ""), clips: paths },
        })
        .select("id")
        .single();
      if (task.error) return { summary: `Could not queue the batch: ${task.error.message}` };
      const result = await startVideoJob({ taskId: task.data.id, clips: paths, videosPerWeek: perWeek, style: String(input.style ?? ""), business });
      await supabase.from("agent_tasks").update({ status: result.status === "failed" ? "failed" : result.status === "running" ? "running" : "queued", result: { note: result.note, providerJobId: result.providerJobId ?? null }, updated_at: new Date().toISOString() }).eq("id", task.data.id);
      if (planId) await supabase.from("plan_steps").update({ status: "in-progress", settings: { videos_per_week: perWeek } }).eq("plan_id", planId).eq("key", "videos");
      await event("video", result.note);
      return { summary: result.note };
    }

    case "propose_text": {
      const phone = normalizePhone(String(input.to_phone ?? ""));
      if (!phone) return { summary: "That phone number doesn't look right." };
      const { error } = await supabase.from("agent_tasks").insert({
        business_id: business.id,
        owner_id: ownerId,
        kind: "send_text",
        status: "waiting_on_owner",
        title: `Text to ${input.to_name ? String(input.to_name) : phone}`,
        payload: { phone, name: input.to_name ?? "", body: String(input.body).slice(0, 640), purpose: input.purpose },
      });
      if (error) return { summary: `Could not draft the text: ${error.message}` };
      return { summary: `Draft is waiting for the owner's approval in the chat. It will not send until they tap Approve.` };
    }

    case "log_job": {
      const value = Math.round(Number(input.value) || 0);
      if (value <= 0) return { summary: "Need a sale amount above zero." };
      const sources = ["post", "google", "walked-by", "friend", "regular", "other"];
      const source = sources.includes(String(input.heard_from)) ? String(input.heard_from) : "other";
      const { error } = await supabase.from("checkouts").insert({ business_id: business.id, owner_id: ownerId, source, amount: value });
      if (error) return { summary: `Could not log the sale: ${error.message}` };
      await event("job", `Sale logged: $${value.toLocaleString()}, heard from ${source.replace("-", " ")}.`);
      const total = snapshot.recovered.month + (source === "post" ? value : 0);
      return { summary: `Logged a $${value.toLocaleString()} sale (${source.replace("-", " ")}). Sales from posts this month: $${total.toLocaleString()}.` };
    }

    case "add_customer": {
      const { error } = await supabase.from("customers").insert({
        business_id: business.id,
        owner_id: ownerId,
        name: String(input.name),
        phone: normalizePhone(String(input.phone ?? "")),
        email: String(input.email ?? ""),
        last_job_value: typeof input.last_job_value === "number" ? input.last_job_value : null,
        source: "consultant",
      });
      if (error) return { summary: `Could not add the customer: ${error.message}` };
      await event("customer", `Added ${String(input.name)} to customers.`);
      return { summary: `Added ${String(input.name)}.` };
    }

    default:
      return { summary: `Unknown tool ${name}.` };
  }
}

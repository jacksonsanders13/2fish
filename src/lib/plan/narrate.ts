import Anthropic from "@anthropic-ai/sdk";
import type { Answers, Estimate } from "./estimate";
import { claudeKey } from "@/lib/ai-key";

export type Narration = {
  summary: string;
  details: Record<string, string>;
  model: string | null;
};

// Claude writes the words. The numbers always come from estimate.ts, and if
// there's no API key (or the call fails) we fall back to the built-in wording
// so the product never depends on the model being up.
export async function narrate(est: Estimate, a: Answers, allowModel = true): Promise<Narration> {
  const fallback: Narration = {
    summary: templateSummary(est, a),
    details: Object.fromEntries(est.steps.map((s) => [s.key, s.detail])),
    model: null,
  };

  const key = claudeKey();
  if (!key || !allowModel) return fallback;

  try {
    const client = new Anthropic({ apiKey: key, timeout: 25_000, maxRetries: 1 });
    const model = "claude-sonnet-5-5";
    const brief = {
      store: est.facts.store,
      score: est.score,
      scoreParts: est.scoreParts,
      facts: est.facts,
      leaks: est.leaks.map((l) => ({ id: l.id, title: l.title, perMonth: l.perMonth })),
      steps: est.steps.map((s) => ({ key: s.key, title: s.title, currentDetail: s.detail, impactPerMonth: s.impact })),
    };

    const res = await client.messages.create({
      model,
      max_tokens: 700,
      system: [
        "You write short, plain copy for 2fish, which posts for small stores and tracks which posts made sales (shoppers asked how they heard about the store, and sales of the posted items).",
        "Audience: a busy store owner reading on a phone between customers. Short sentences. Specific. No hype words.",
        "Never invent numbers. Only use the dollar figures and counts you are given.",
        "Do not use the words: unlock, unleash, elevate, empower, supercharge, transform, seamless, robust, leverage, journey, streamline, effortless.",
        'Reply with JSON only: {"summary": string, "details": {stepKey: string}}.',
        "summary: two sentences that give the store's score out of 100, name the biggest fix and what happens first.",
        "details: for each step key, one or two sentences (max 30 words) tailored to this business. Keep the given numbers.",
      ].join(" "),
      messages: [{ role: "user", content: JSON.stringify(brief) }],
    });

    const text = res.content.find((c) => c.type === "text")?.text ?? "";
    const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as {
      summary?: string;
      details?: Record<string, string>;
    };
    if (!json.summary) return fallback;

    return {
      summary: json.summary,
      details: { ...fallback.details, ...(json.details ?? {}) },
      model,
    };
  } catch {
    return fallback;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function templateSummary(est: Estimate, _a: Answers) {
  const top = est.leaks[0];
  return `${est.facts.store} scored ${est.score} out of 100. The biggest fix is to ${top.title.charAt(0).toLowerCase()}${top.title.slice(1)}, worth about $${top.perMonth.toLocaleString()} a month, so that's step 1.`;
}

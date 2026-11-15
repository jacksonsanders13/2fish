import Anthropic from "@anthropic-ai/sdk";
import type { Answers, Estimate } from "./estimate";

export type Narration = {
  summary: string;
  details: Record<string, string>;
  model: string | null;
};

// Claude writes the words. The numbers always come from estimate.ts, and if
// there's no API key (or the call fails) we fall back to the built-in wording
// so the product never depends on the model being up.
export async function narrate(est: Estimate, a: Answers): Promise<Narration> {
  const fallback: Narration = {
    summary: templateSummary(est, a),
    details: Object.fromEntries(est.steps.map((s) => [s.key, s.detail])),
    model: null,
  };

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return fallback;

  try {
    const client = new Anthropic({ apiKey: key });
    const model = "claude-sonnet-5-5";
    const brief = {
      business: est.facts.kind,
      biggestHeadache: a.headache,
      facts: est.facts,
      leaks: est.leaks.map((l) => ({ id: l.id, title: l.title, perMonth: l.perMonth })),
      steps: est.steps.map((s) => ({ key: s.key, title: s.title, currentDetail: s.detail, impactPerMonth: s.impact })),
    };

    const res = await client.messages.create({
      model,
      max_tokens: 700,
      system: [
        "You write short, plain copy for 2fish, a growth tool for small local businesses.",
        "Audience: a busy owner reading on a phone. Short sentences. Specific. No hype words.",
        "Never invent numbers. Only use the dollar figures and counts you are given.",
        "Do not use the words: unlock, unleash, elevate, empower, supercharge, transform, seamless, robust, leverage, journey, streamline, effortless.",
        'Reply with JSON only: {"summary": string, "details": {stepKey: string}}.',
        "summary: two sentences that name the biggest leak in their own words and what happens first. Mention their headache if it fits.",
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

function templateSummary(est: Estimate, a: Answers) {
  const top = est.leaks[0];
  const kind = est.facts.kind === "Something else" ? "business" : est.facts.kind.toLowerCase() + " business";
  const headache = a.headache?.trim() ? ` You said your biggest headache is: "${a.headache.trim()}".` : "";
  return `Your ${kind} is losing about $${est.totalMonthly.toLocaleString()} a month, and ${top.title.toLowerCase()} is the biggest piece.${headache} Step 1 goes after that first.`;
}

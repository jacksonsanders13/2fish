// A quick check for the patterns that make a post read as AI-written. It only
// flags; the editor pass (see captions.ts) does the rewriting. Patterns come
// from the AI-tells lists in coreyhaines31/marketingskills (MIT).

const PHRASES = [
  "elevate",
  "must-have",
  "must have",
  "obsessed",
  "curated",
  "game-changer",
  "game changer",
  "unlock",
  "vibes",
  "level up",
  "treat yourself",
  "you deserve",
  "look no further",
  "say goodbye to",
  "here's the thing",
  "in today's",
  "whether you're",
  "tag a friend",
  "double tap",
  "agree?",
  "thoughts?",
];

const CHECKS: { why: string; test: (t: string) => boolean }[] = [
  { why: "em dash", test: (t) => /—|–| - /.test(t) },
  { why: "contrast reveal (it's not X, it's Y)", test: (t) => /\b(it'?s|this is|that'?s) not (just )?[^.?!]{1,40}[,.;] (it'?s|this is|that'?s)\b/i.test(t) || /\bnot just\b[^.?!]{1,40}\bbut\b/i.test(t) },
  { why: "negation list (no X, no Y)", test: (t) => /\bno [a-z]+[^.?!]{0,25}, no [a-z]+/i.test(t) },
  { why: "self-answered question or colon reveal", test: (t) => /\b(the (best|secret|result|catch|twist|best part)[^.?!:]{0,15})[?:] /i.test(t) },
  { why: "more than one exclamation mark", test: (t) => (t.match(/!/g) ?? []).length > 1 },
  { why: "stock phrase", test: (t) => PHRASES.some((p) => t.toLowerCase().includes(p)) },
  { why: "weak filler words", test: (t) => /\b(very|really|truly|incredibly|basically|actually)\b/i.test(t) },
  { why: "too many emoji", test: (t) => (t.match(/\p{Extended_Pictographic}/gu) ?? []).length > 2 },
  { why: "broetry (one short line after another)", test: (t) => t.split("\n").filter((l) => l.trim() && !l.trim().startsWith("#")).length >= 5 },
];

/** What's wrong with a post, in plain words. Empty when it's clean. */
export function findTells(hook: string, caption: string): string[] {
  const text = `${hook}\n${caption}`;
  const out = CHECKS.filter((c) => c.test(text)).map((c) => c.why);
  if (hook.split(/\s+/).filter(Boolean).length > 12) out.push("hook over 12 words");
  const body = caption.replace(/(^|\s)#\S+/g, "").trim();
  if (body.length > 420) out.push("caption too long");
  return out;
}

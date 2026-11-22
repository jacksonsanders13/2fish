import type { Leak, StepStatus } from "@/lib/data";
import { roundTen } from "@/lib/format";

// The Store Grader's math lives here, in plain code, so every score and every
// dollar figure is explainable and works with or without Claude. Claude only
// writes words.

export type Answers = {
  store: string;
  instagram: string;
  posts: string;
  sale: string;
  reviews: string;
  track: string;
};

export type PlanStepDraft = {
  rank: number;
  key: string;
  title: string;
  detail: string;
  impact: number;
  status: StepStatus;
  href: string;
};

export type ScorePart = { label: string; points: number; max: number };

export type Estimate = {
  score: number;
  scoreParts: ScorePart[];
  totalMonthly: number;
  leaks: Leak[];
  steps: PlanStepDraft[];
  facts: Facts;
};

export type Facts = {
  kind: string;
  store: string;
  instagram: string;
  postsPerWeek: number;
  sale: number;
  reviews: number;
  reviewTarget: number;
};

const WEEKS = 4.3;
// Our working guess until a store has its own numbers: one extra sale for
// every two posts. The proof report replaces it with the real rate.
const SALES_PER_POST = 0.5;
const POST_GOAL = 7;
const REVIEW_TARGET = 100;

const POSTS_PER_WEEK: Record<string, number> = {
  "Most days": 5,
  "About once a week": 1,
  "A few times a month": 0.5,
  "Almost never": 0,
};

function num(v: string, fallback: number) {
  const n = Number(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function cleanHandle(v: string) {
  const h = v.trim().replace(/^@+/, "").replace(/\s+/g, "");
  return /^(none|no|n\/a|-)$/i.test(h) ? "" : h;
}

export function estimate(a: Answers): Estimate {
  const store = a.store.trim() || "Your store";
  const instagram = cleanHandle(a.instagram);
  const postsPerWeek = POSTS_PER_WEEK[a.posts] ?? 0;
  const sale = num(a.sale, 50);
  const reviews = Math.round(num(a.reviews, 0));

  // The score: four parts that add up to 100.
  const scoreParts: ScorePart[] = [
    { label: "How often you post", points: Math.round((Math.min(postsPerWeek, POST_GOAL) / POST_GOAL) * 40), max: 40 },
    { label: "Google reviews", points: Math.round((Math.min(reviews, REVIEW_TARGET) / REVIEW_TARGET) * 25), max: 25 },
    { label: "Knowing which posts sell", points: a.track === "Yes, we track it" ? 20 : a.track === "Sort of" ? 8 : 0, max: 20 },
    { label: "An Instagram account", points: instagram ? 15 : 0, max: 15 },
  ];
  const score = scoreParts.reduce((s, p) => s + p.points, 0);

  // The fixes, each with what it could be worth a month.
  const candidates: Leak[] = [];

  const extraPosts = Math.max(0, POST_GOAL - postsPerWeek);
  if (extraPosts > 0) {
    const perMonth = roundTen(extraPosts * WEEKS * SALES_PER_POST * sale);
    candidates.push({
      id: "posting",
      title: postsPerWeek === 0 ? "Start posting every day" : "Post every day, not now and then",
      perMonth,
      short: postsPerWeek === 0 ? "You're barely posting right now." : `About ${fmt(postsPerWeek)} ${postsPerWeek === 1 ? "post" : "posts"} a week now. The goal is 7.`,
      detail: "Shoppers come in for what they saw this week. New arrivals, try-ons and the gift table, posted daily from photos you already take.",
      math: `${fmt(extraPosts)} more posts a week × 4.3 weeks × 1 sale per 2 posts × $${sale} average sale`,
    });
  }

  if (a.track !== "Yes, we track it") {
    const perMonth = roundTen(Math.max(postsPerWeek, 1) * WEEKS * SALES_PER_POST * sale);
    candidates.push({
      id: "tracking",
      title: "Find out which posts bring people in",
      perMonth,
      short: "Right now you can't tell which posts bring people in.",
      detail: "Ask \"How'd you hear about us?\" at checkout and tap the answer. Count how many of each posted item sold. Then make more of what works.",
      math: `Sales your current posts may already bring in: ${fmt(Math.max(postsPerWeek, 1))} posts a week × 4.3 × 1 sale per 2 posts × $${sale}`,
    });
  }

  if (reviews < REVIEW_TARGET) {
    const extraSales = Math.min(8, (REVIEW_TARGET - reviews) / 12);
    const perMonth = roundTen(extraSales * sale);
    candidates.push({
      id: "reviews",
      title: "Get more Google reviews",
      perMonth,
      short: `You have ${reviews}. We aim stores for ${REVIEW_TARGET} or more.`,
      detail: "People searching for a shop nearby pick the one with more reviews. A small card at the register and a reply to every review close the gap.",
      math: `${extraSales.toFixed(1)} more sales a month × $${sale}`,
    });
  }

  if (!instagram) {
    candidates.push({
      id: "instagram",
      title: "Start an Instagram account for the store",
      perMonth: roundTen(2 * sale),
      short: "Your store doesn't have an Instagram yet.",
      detail: "It's where local shoppers look first. 2fish can fill it with a week of posts from your photos.",
      math: `About 2 sales a month to start × $${sale}`,
    });
  }

  const leaks = candidates.sort((x, y) => y.perMonth - x.perMonth).slice(0, 3);
  const totalMonthly = leaks.reduce((s, l) => s + l.perMonth, 0);
  const facts: Facts = { kind: "Store", store, instagram, postsPerWeek, sale, reviews, reviewTarget: REVIEW_TARGET };
  const steps = leaks.map((leak, i) => stepFor(leak, i + 1));

  return { score, scoreParts, totalMonthly, leaks, steps, facts };
}

function fmt(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function stepFor(leak: Leak, rank: number): PlanStepDraft {
  const base = { rank, impact: leak.perMonth, status: "not-started" as StepStatus };
  switch (leak.id) {
    case "posting":
      return {
        ...base,
        key: "posts",
        title: "Post 7 times a week from your photos",
        detail: "Send product photos and try-on clips. Every Monday you get 7 posts with captions to approve.",
        href: "/dashboard/videos",
      };
    case "tracking":
      return {
        ...base,
        key: "proof",
        title: "Track what your posts sell",
        detail: "One tap at checkout for how each shopper found you, plus a count of the items each post showed.",
        href: "/dashboard",
      };
    case "reviews":
      return {
        ...base,
        key: "reviews",
        title: "Get to 100 Google reviews",
        detail: "A review card at the register and a drafted reply to every new review.",
        href: "/dashboard",
      };
    default:
      return {
        ...base,
        key: "instagram",
        title: "Start the store's Instagram",
        detail: "Set up the account, then the first week of posts goes up from your photos.",
        href: "/dashboard",
      };
  }
}

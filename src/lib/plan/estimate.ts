import type { Leak, StepStatus } from "@/lib/data";
import { roundTen } from "@/lib/format";

// The dollar math lives here, in plain code, so every estimate is explainable
// and the plan works with or without Claude. Claude only writes words.

export type Answers = {
  type: string;
  calls: string;
  missed: string;
  job: string;
  reviews: string;
  ask: string;
  social: string;
  winback: string;
  headache: string;
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

export type Estimate = {
  totalMonthly: number;
  leaks: Leak[];
  steps: PlanStepDraft[];
  facts: Facts;
};

export type Facts = {
  kind: string;
  callsPerWeek: number;
  missedPerWeek: number;
  job: number;
  reviews: number;
  reviewTarget: number;
  pastCustomers: number;
};

const WEEKS = 4.3;
const BOOK_RATE = 0.3;

function num(v: string, fallback: number) {
  const n = Number(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function estimate(a: Answers): Estimate {
  const kind = a.type || "Something else";
  const retail = kind === "Boutique";
  const callsPerWeek = num(a.calls, retail ? 40 : 20);
  const job = num(a.job, retail ? 60 : 300);
  const reviews = Math.round(num(a.reviews, 0));

  // Missed calls. Voicemail and "nothing" lose most of the caller; a person
  // answering loses a few.
  const missRate = a.missed === "Someone else answers" ? 0.1 : a.missed === "Nothing, it just rings" ? 0.35 : 0.3;
  const missedPerWeek = Math.round(callsPerWeek * missRate);
  const missedCalls = roundTen(missedPerWeek * WEEKS * job * BOOK_RATE);

  // Reviews. The gap to the top local competitors, tempered by whether they ask already.
  const reviewTarget = retail ? 150 : 70;
  const gap = Math.max(0, reviewTarget - reviews);
  const askFactor = a.ask === "Always" ? 0.4 : a.ask === "Sometimes" ? 0.8 : 1;
  const extraJobs = Math.min(4, gap / 20) * askFactor;
  const reviewsLeak = roundTen(extraJobs * job);

  // Past customers. Rough list size from call volume, then a small monthly
  // return rate when someone actually reminds them.
  const pastCustomers = Math.round(callsPerWeek * BOOK_RATE * 52 * 1.5);
  const winbackRate = a.winback === "Never" ? 0.02 : a.winback === "Rarely" ? 0.012 : 0.003;
  const pastLeak = roundTen(pastCustomers * winbackRate * job);

  // Social. Posting cadence to extra jobs a month.
  const socialJobs =
    a.social === "Almost never" ? 2 : a.social === "A few times a month" ? 1.5 : a.social === "About once a week" ? 1 : 0.25;
  const socialLeak = roundTen(socialJobs * job);

  const unsorted: Leak[] = [
    {
      id: "missed-calls",
      title: "Missed calls",
      perMonth: missedCalls,
      short: `About ${missedPerWeek} of your ${callsPerWeek} weekly calls go unanswered.`,
      detail:
        a.missed === "Someone else answers"
          ? `Someone picks up most of the time, but a few callers still slip through each week. At a $${job} average, those are worth getting back.`
          : `Most people who hit voicemail don't leave one. They call the next company on the list. At a $${job} average job, booking just 3 of every 10 of those callers is worth about $${missedCalls.toLocaleString()} a month.`,
      math: `${missedPerWeek} missed calls × 4.3 weeks × $${job} × 30% booked`,
    },
    {
      id: "past-customers",
      title: "Past customers never hear from you",
      perMonth: pastLeak,
      short: `Roughly ${pastCustomers} past customers, and ${a.winback === "Yes, regularly" ? "only an occasional" : "no"} reminder when it's time again.`,
      detail: retail
        ? "People who bought once will buy again if they hear from you. A short text when something new comes in brings a few back each month."
        : "Most of your work repeats every 12 to 18 months. A short text when it's time brings a few customers back each month with no ad spend.",
      math: `${pastCustomers} customers × ${(winbackRate * 100).toFixed(1)}% a month × $${job}`,
    },
    {
      id: "reviews",
      title: "Too few Google reviews",
      perMonth: reviewsLeak,
      short: `You have ${reviews}. The top ${retail ? "shops" : "companies"} near you average about ${reviewTarget}.`,
      detail: "People pick the business with more reviews, even at the same price. Asking after every job closes that gap in a few months.",
      math: `${extraJobs.toFixed(1)} extra jobs a month × $${job}`,
    },
    {
      id: "social",
      title: socialLabel(a.social),
      perMonth: socialLeak,
      short: `${a.social || "Posting rarely"} isn't enough to get seen locally.`,
      detail: retail
        ? "Short clips of what's new in the shop do well locally. You already have the product. It needs to be filmed and posted most days."
        : "Short before-and-after clips do well for home services. You already film them. They need to be cut and posted most days.",
      math: `${socialJobs} extra jobs a month × $${job}`,
    },
  ];
  const leaks = [...unsorted].sort((x, y) => y.perMonth - x.perMonth);

  const totalMonthly = leaks.reduce((s, l) => s + l.perMonth, 0);

  const steps: PlanStepDraft[] = leaks.map((leak, i) => stepFor(leak, i + 1, { kind, callsPerWeek, missedPerWeek, job, reviews, reviewTarget, pastCustomers }));

  return {
    totalMonthly,
    leaks,
    steps,
    facts: { kind, callsPerWeek, missedPerWeek, job, reviews, reviewTarget, pastCustomers },
  };
}

function socialLabel(social: string) {
  if (social === "Almost never") return "Almost never posting";
  if (social === "A few times a month") return "Posting a few times a month";
  if (social === "Most days") return "Posting without a plan";
  return "Posting once a week";
}

function stepFor(leak: Leak, rank: number, f: Facts): PlanStepDraft {
  switch (leak.id) {
    case "missed-calls":
      return {
        rank,
        key: "text-back",
        title: "Text back every missed call",
        detail: `A text goes out 10 seconds after any call you can't take. About ${f.missedPerWeek} a week for you. You see the replies on your phone.`,
        impact: leak.perMonth,
        status: "not-started",
        href: "/dashboard/text-back",
      };
    case "past-customers":
      return {
        rank,
        key: "winback",
        title: f.kind === "Boutique" ? "Text past customers when something new comes in" : "Remind past customers it's time again",
        detail: `One short text to the roughly ${f.pastCustomers} people you've already served. You approve the message, 2fish sends 20 a day.`,
        impact: leak.perMonth,
        status: "not-started",
        href: "/dashboard",
      };
    case "reviews":
      return {
        rank,
        key: "reviews",
        title: "Ask every customer for a Google review",
        detail: `Sent the morning after each job with your Google link. Gets you from ${f.reviews} toward ${f.reviewTarget} over a few months.`,
        impact: leak.perMonth,
        status: "not-started",
        href: "/dashboard",
      };
    default:
      return {
        rank,
        key: "videos",
        title: "Post 7 short videos a week",
        detail: "Upload the clips you already shoot. 2fish cuts them into captioned vertical videos, one for each day.",
        impact: leak.perMonth,
        status: "not-started",
        href: "/dashboard/videos",
      };
  }
}

// Fake data for the Phase 1 mockup. One fictional Raleigh power washing
// company, used on every screen so the numbers agree with each other.

export const business = {
  name: "Oak & Ash Exterior Cleaning",
  shortName: "Oak & Ash",
  owner: "Dana Whitfield",
  ownerFirst: "Dana",
  city: "Raleigh, NC",
  since: 2019,
  crew: 3,
  phone: "(919) 555-0188",
  avgJob: 385,
  callsPerWeek: 20,
  missedPerWeek: 6,
  reviews: 14,
  competitorReviews: 70,
  pastCustomers: 310,
};

export type LeakId = "missed-calls" | "past-customers" | "reviews" | "social";

export type Leak = {
  id: LeakId;
  title: string;
  perMonth: number;
  short: string;
  detail: string;
  math: string;
};

export const leaks: Leak[] = [
  {
    id: "missed-calls",
    title: "Missed calls",
    perMonth: 2980,
    short: "6 of your 20 weekly calls go to voicemail.",
    detail:
      "Most people who hit voicemail don't leave one. They call the next company on the list. At a $385 average job, booking just 3 of every 10 of those callers is worth about $2,980 a month.",
    math: "6 missed calls × 4.3 weeks × $385 × 30% booked",
  },
  {
    id: "past-customers",
    title: "Past customers never hear from you",
    perMonth: 2310,
    short: "About 310 past customers, and nobody reminds them it's been a year.",
    detail:
      "Driveways and decks need a wash every 12 to 18 months. A short text when it's time brings a few back each month with no ad spend.",
    math: "310 customers × 2% a month × $385",
  },
  {
    id: "reviews",
    title: "Too few Google reviews",
    perMonth: 1150,
    short: "You have 14. The top three power washers in Raleigh average 70.",
    detail:
      "People pick the company with more reviews, even at the same price. Asking after every job closes that gap in a few months.",
    math: "3 extra jobs a month × $385",
  },
  {
    id: "social",
    title: "Posting once a week",
    perMonth: 620,
    short: "One post a week isn't enough to get seen in Raleigh.",
    detail:
      "Short before-and-after clips do well for home services. You already film them. They need to be cut and posted most days.",
    math: "1 to 2 extra jobs a month × $385",
  },
];

export const totalLeak = leaks.reduce((sum, l) => sum + l.perMonth, 0);

export type StepStatus = "live" | "in-progress" | "needs-you" | "done" | "not-started";

export type PlanStep = {
  rank: number;
  title: string;
  detail: string;
  status: StepStatus;
  impact: number;
  action: { label: string; href: string };
};

// hrefs are relative to the direction root, e.g. /a/videos.
export const plan: PlanStep[] = [
  {
    rank: 1,
    title: "Text back every missed call",
    detail: "Live since Nov 3. 11 missed calls texted back, 4 turned into jobs.",
    status: "live",
    impact: 2980,
    action: { label: "See conversations", href: "text-back" },
  },
  {
    rank: 2,
    title: "Remind past customers it's time for a wash",
    detail:
      "310 customers from 2024 and 2025. The message is drafted. You approve it, 2fish sends 20 a day.",
    status: "needs-you",
    impact: 2310,
    action: { label: "Review the message", href: "dashboard" },
  },
  {
    rank: 3,
    title: "Ask every customer for a Google review",
    detail: "Sent the morning after each job. 9 sent this week, 3 new reviews so far.",
    status: "in-progress",
    impact: 1150,
    action: { label: "See requests", href: "dashboard" },
  },
  {
    rank: 4,
    title: "Post 7 short videos a week",
    detail: "Tuesday's clips are cut into 7 videos with captions. They need your okay.",
    status: "needs-you",
    impact: 620,
    action: { label: "Approve videos", href: "videos" },
  },
  {
    rank: 5,
    title: "Fix your Google Business hours and photos",
    detail: "Weekend hours were wrong. Fixed Nov 2, plus 12 new job photos.",
    status: "done",
    impact: 180,
    action: { label: "View listing", href: "dashboard" },
  },
];

export const recovered = {
  amount: 2310,
  jobs: 6,
  period: "Nov 1 to 14",
  pace: 4900,
};

export const stats = [
  { label: "Missed calls texted back", value: "11", sub: "4 booked" },
  { label: "Google reviews", value: "17", sub: "was 14 on Nov 1" },
  { label: "Videos posted", value: "5", sub: "7 waiting on you" },
];

export type Activity = {
  when: string;
  text: string;
  kind: "call" | "video" | "review" | "job" | "reminder";
};

export const activity: Activity[] = [
  { when: "2:14 PM", text: "Missed call from (919) 555-0142. Texted back in 8 seconds.", kind: "call" },
  { when: "11:30 AM", text: "7 videos ready to post from Tuesday's clips.", kind: "video" },
  { when: "Yesterday", text: "Review requests sent to 3 customers after their jobs closed.", kind: "review" },
  { when: "Yesterday", text: "New 5-star review from Priya N. \"Deck looks brand new.\"", kind: "review" },
  { when: "Nov 12", text: "Tom R. booked a driveway and walkway from a text-back. $450.", kind: "job" },
  { when: "Nov 11", text: "Reminder drafted for 310 past customers. Waiting on your okay.", kind: "reminder" },
];

export type VideoCard = {
  id: number;
  title: string;
  length: string;
  day: string;
  caption: string;
  tone: "navy" | "surface";
};

export const videos: VideoCard[] = [
  { id: 1, title: "Before and after: Cary driveway", length: "0:22", day: "Mon", caption: "Twelve years of grime, gone in an afternoon. Cary, NC.", tone: "navy" },
  { id: 2, title: "Deck restore in 60 seconds", length: "0:58", day: "Tue", caption: "Soft wash, brighten, seal. Here's the whole thing sped up.", tone: "surface" },
  { id: 3, title: "Why we soft wash roofs", length: "0:34", day: "Wed", caption: "Pressure washing a roof wrecks shingles. Here's what we do instead.", tone: "surface" },
  { id: 4, title: "Gutter brightening, close up", length: "0:19", day: "Thu", caption: "Those black streaks aren't permanent. Watch.", tone: "surface" },
  { id: 5, title: "Customer question: how often?", length: "0:41", day: "Fri", caption: "Most Raleigh driveways need it every 12 to 18 months.", tone: "navy" },
  { id: 6, title: "Meet the crew", length: "0:27", day: "Sat", caption: "Three of us, two trucks, since 2019.", tone: "surface" },
  { id: 7, title: "Oak & Ash in 15 seconds", length: "0:15", day: "Sun", caption: "Driveways, decks, roofs, gutters. Text us for a quote.", tone: "navy" },
];

export const uploadedClips = [
  { name: "IMG_4471.MOV", length: "0:48" },
  { name: "IMG_4472.MOV", length: "1:12" },
  { name: "IMG_4478.MOV", length: "0:31" },
  { name: "IMG_4480.MOV", length: "2:04" },
  { name: "IMG_4483.MOV", length: "0:55" },
];

export type Message = {
  from: "system" | "business" | "customer" | "owner-note";
  text: string;
  time?: string;
};

export const textBackSetup = {
  line: "(919) 555-0188",
  delay: "10 seconds",
  hours: "8:00 AM to 9:00 PM",
  template:
    "Hi, this is Dana at Oak & Ash Exterior Cleaning. Sorry I missed your call, I'm on a job. What can I help with? Reply here or I'll call you back within the hour.",
};

export const conversation: Message[] = [
  { from: "system", text: "Missed call from (919) 555-0142", time: "2:14 PM" },
  { from: "business", text: textBackSetup.template, time: "2:14 PM" },
  { from: "customer", text: "Hey, looking for a quote on a driveway and back patio. About 900 sq ft total.", time: "2:19 PM" },
  { from: "owner-note", text: "2fish drafted the reply below. Dana approved it with one tap from the truck." },
  { from: "business", text: "Happy to help. A 900 sq ft driveway and patio usually runs $350 to $450. I can swing by Thursday morning to confirm. Does 9 AM work?", time: "2:21 PM" },
  { from: "customer", text: "Thursday at 9 works. 4120 Birchwood Ct.", time: "2:26 PM" },
  { from: "business", text: "Got it. See you Thursday at 9. I'll text when I'm on the way.", time: "2:26 PM" },
  { from: "system", text: "Booked. Driveway and patio, est. $450", time: "2:26 PM" },
];

export type AuditQuestion =
  | { id: string; prompt: string; help?: string; type: "choice"; options: string[] }
  | {
      id: string;
      prompt: string;
      help?: string;
      type: "number";
      prefix?: string;
      suffix?: string;
      placeholder: string;
    }
  | { id: string; prompt: string; help?: string; type: "text"; placeholder: string };

export const auditQuestions: AuditQuestion[] = [
  {
    id: "type",
    prompt: "What kind of business do you run?",
    type: "choice",
    options: ["Power washing", "Landscaping", "Cleaning", "Boutique", "Something else"],
  },
  {
    id: "calls",
    prompt: "About how many calls do you get a week?",
    help: "A rough guess is fine.",
    type: "number",
    suffix: "calls a week",
    placeholder: "20",
  },
  {
    id: "missed",
    prompt: "When you can't pick up, what happens?",
    type: "choice",
    options: ["It goes to voicemail", "Nothing, it just rings", "Someone else answers"],
  },
  {
    id: "job",
    prompt: "What's your average job or sale worth?",
    type: "number",
    prefix: "$",
    placeholder: "385",
  },
  {
    id: "reviews",
    prompt: "How many Google reviews do you have?",
    help: "Open Google Maps and search your business name if you're not sure.",
    type: "number",
    suffix: "reviews",
    placeholder: "14",
  },
  {
    id: "ask",
    prompt: "Do you ask customers for a review after a job?",
    type: "choice",
    options: ["Always", "Sometimes", "Never"],
  },
  {
    id: "social",
    prompt: "How often do you post on social media?",
    type: "choice",
    options: ["Most days", "About once a week", "A few times a month", "Almost never"],
  },
  {
    id: "winback",
    prompt: "Do you ever reach back out to past customers?",
    type: "choice",
    options: ["Yes, regularly", "Rarely", "Never"],
  },
  {
    id: "headache",
    prompt: "What's your biggest headache right now?",
    help: "One or two sentences. This shapes your plan.",
    type: "text",
    placeholder: "Phone rings while I'm on a roof and I lose the job to whoever picks up first.",
  },
];

export const sampleAnswers: Record<string, string> = {
  type: "Power washing",
  calls: "20",
  missed: "It goes to voicemail",
  job: "385",
  reviews: "14",
  ask: "Sometimes",
  social: "About once a week",
  winback: "Rarely",
  headache: "Phone rings while I'm on a roof and I lose the job to whoever picks up first.",
};

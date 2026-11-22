// Sample data for the landing page and previews. Linden Row is a made-up
// Raleigh store (a boutique), used everywhere so the numbers agree with each other.
// (The text-back and leak data further down is from the old home-services
// version and only feeds screens that are hidden now.)

export const business = {
  name: "Linden Row Boutique",
  shortName: "Linden Row",
  owner: "Maya Ellison",
  ownerFirst: "Maya",
  city: "Raleigh, NC",
  since: 2019,
  avgSale: 68,
  postsLastMonth: 6,
  reviews: 41,
};

// The first four are from the old home-services audit; the grader uses the rest.
export type LeakId = "missed-calls" | "past-customers" | "reviews" | "social" | "posting" | "tracking" | "instagram";

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

export const plan: PlanStep[] = [
  {
    rank: 1,
    title: "Post 7 times a week from your own photos",
    detail: "Live since Nov 3. 14 posts up so far, each with its own code.",
    status: "live",
    impact: 1240,
    action: { label: "See this week's posts", href: "/dashboard/videos" },
  },
  {
    rank: 2,
    title: "Approve next week's 7 posts",
    detail: "Monday's photos are turned into 7 posts with captions. They need your okay.",
    status: "needs-you",
    impact: 620,
    action: { label: "Approve posts", href: "/dashboard/videos" },
  },
  {
    rank: 3,
    title: "Show try-ons, not just flat lays",
    detail: "Try-on clips have sold more than flat lays so far. Next week's pack leans that way.",
    status: "in-progress",
    impact: 420,
    action: { label: "See what sold", href: "/dashboard" },
  },
  {
    rank: 4,
    title: "Reply to every Google review",
    detail: "Replies are drafted for 3 new reviews. You approve, 2fish posts them.",
    status: "in-progress",
    impact: 180,
    action: { label: "See replies", href: "/dashboard" },
  },
  {
    rank: 5,
    title: "Fix your Google hours and photos",
    detail: "Sunday hours were wrong. Fixed Nov 2, plus 10 new product photos.",
    status: "done",
    impact: 90,
    action: { label: "View listing", href: "/dashboard" },
  },
];

// Tracked sales: promo codes from posts, used at the register.
export const recovered = {
  amount: 1840,
  sales: 23,
  period: "Nov 1 to 14",
  pace: 3900,
};

export const stats = [
  { label: "Posts this month", value: "14", sub: "7 waiting on you" },
  { label: "Codes used", value: "23", sub: "$1,840 in sales" },
  { label: "Google reviews", value: "44", sub: "was 41 on Nov 1" },
];

export type Activity = {
  when: string;
  text: string;
  kind: "call" | "video" | "review" | "job" | "reminder";
};

export const activity: Activity[] = [
  { when: "2:14 PM", text: "A shopper used LINDEN4 at the register. $86.", kind: "job" },
  { when: "11:30 AM", text: "7 posts ready from Monday's photos. Waiting on your okay.", kind: "video" },
  { when: "Yesterday", text: "The green wrap dress try-on is up to 6 code sales.", kind: "job" },
  { when: "Yesterday", text: "Reply drafted for a new 5-star Google review.", kind: "review" },
  { when: "Nov 12", text: "Weekly report: try-on clips sold more than flat lays.", kind: "reminder" },
  { when: "Nov 11", text: "New arrivals post went up with code LINDEN2.", kind: "video" },
];

export type VideoCard = {
  id: number;
  title: string;
  length: string;
  day: string;
  caption: string;
  tone: "night" | "surface";
};

export const videos: VideoCard[] = [
  { id: 1, title: "Try-on: the green wrap dress", length: "0:18", day: "Mon", caption: "Three ways to wear it, one dress. Say LINDEN1 at the register for 10% off.", tone: "night" },
  { id: 2, title: "New arrivals, unboxed", length: "0:24", day: "Tue", caption: "Fall knits just landed. Small run, so come early. Code LINDEN2.", tone: "surface" },
  { id: 3, title: "Behind the counter", length: "0:15", day: "Wed", caption: "How Maya picks what goes on the front table. Code LINDEN3.", tone: "surface" },
  { id: 4, title: "One outfit, under $120", length: "0:21", day: "Thu", caption: "Top, jeans, earrings. All in store now. Code LINDEN4.", tone: "surface" },
  { id: 5, title: "Gift table for under $40", length: "0:19", day: "Fri", caption: "Candles, scarves and the mugs everyone asks about. Code LINDEN5.", tone: "night" },
  { id: 6, title: "Saturday in the shop", length: "0:12", day: "Sat", caption: "Come say hi. We're open 10 to 6. Code LINDEN6.", tone: "surface" },
  { id: 7, title: "Linden Row in 15 seconds", length: "0:15", day: "Sun", caption: "Clothes, gifts and a dressing room with good light. Code LINDEN7.", tone: "night" },
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
  | { id: string; prompt: string; help?: string; type: "text"; placeholder: string }
  | { id: string; prompt: string; help?: string; type: "line"; placeholder: string; prefix?: string };

// The Store Grader: six questions, about 2 minutes.
export const auditQuestions: AuditQuestion[] = [
  {
    id: "store",
    prompt: "What's your store called?",
    type: "line",
    placeholder: "Linden Row Boutique",
  },
  {
    id: "instagram",
    prompt: "What's the store's Instagram handle?",
    help: "Type \"none\" if the store doesn't have one yet.",
    type: "line",
    prefix: "@",
    placeholder: "lindenrow",
  },
  {
    id: "posts",
    prompt: "How often do you post on Instagram?",
    help: "Or TikTok, whichever you use most. Think about last month.",
    type: "choice",
    options: ["Most days", "About once a week", "A few times a month", "Almost never"],
  },
  {
    id: "sale",
    prompt: "What does a shopper spend on an average visit?",
    help: "A rough guess is fine.",
    type: "number",
    prefix: "$",
    placeholder: "68",
  },
  {
    id: "reviews",
    prompt: "How many Google reviews does the store have?",
    help: "Search your store's name on Google Maps if you're not sure.",
    type: "number",
    suffix: "reviews",
    placeholder: "41",
  },
  {
    id: "track",
    prompt: "Can you tell which posts bring shoppers into the store?",
    type: "choice",
    options: ["Yes, we track it", "Sort of", "No idea"],
  },
];

export const sampleAnswers: Record<string, string> = {
  store: "Linden Row Boutique",
  instagram: "lindenrow",
  posts: "A few times a month",
  sale: "68",
  reviews: "41",
  track: "No idea",
};

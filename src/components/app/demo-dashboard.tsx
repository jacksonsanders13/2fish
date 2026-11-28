"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import type { DashboardData } from "@/lib/app/queries";
import { addDays, mondayOf } from "@/lib/pilot/dates";
import type { HomeData } from "@/lib/pilot/queries";
import type { Post } from "@/lib/pilot/types";
import { Dashboard } from "./dashboard";
import { DemoProvider, type DemoApi } from "./demo";

type Frame = Omit<HomeData, "calendar" | "drafts">;

// Where the test drive's links would have gone in the real app.
const SOON: Record<string, string> = {
  videos: "the photo upload, where the owner sends Fisher product photos",
  settings: "Settings, where the owner connects Square and Instagram",
  report: "the monthly report: sales from posts, best post, and what it all earned",
  examples: "examples of posts that sold for other stores",
};

export function DemoDashboard({ data, frame, today, soon }: { data: DashboardData; frame: Frame; today: string; soon?: string }) {
  const [posts, setPosts] = useState<Post[]>(() => samplePosts(today));
  const [note, setNote] = useState(soon && SOON[soon] ? SOON[soon] : null);

  const home = useMemo<HomeData>(
    () => ({
      ...frame,
      calendar: posts.filter((p) => p.postOn >= frame.gridStart && p.postOn <= frame.gridEnd),
      drafts: posts.filter((p) => p.status === "draft"),
    }),
    [posts, frame],
  );

  const api: DemoApi = useMemo(
    () => ({
      setStatus: (id, status) => setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, status } : p))),
      approveAll: () => setPosts((ps) => ps.map((p) => (p.status === "draft" ? { ...p, status: "approved" } : p))),
      move: (id, postOn) => setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, postOn } : p))),
      reply,
    }),
    [],
  );

  return (
    <DemoProvider value={api}>
      <Dashboard
        data={data}
        home={home}
        today={today}
        messages={[]}
        chats={[]}
        conversationId={null}
        firstEver={false}
        tasks={[]}
        agentReady
        intro={`Hi, I'm Fisher, your marketing helper. I wrote next week's 7 posts for ${data.business.name} from your photos. Tap one to read it, then approve the ones you like. Nothing goes up without your okay.`}
        userId="demo"
      />
      {note ? (
        <div role="status" className="fixed inset-x-4 bottom-24 z-40 mx-auto flex max-w-md items-start gap-3 rounded-lg bg-night p-4 text-sm text-white md:bottom-6">
          <p className="flex-1">
            In the real app that opens {note}. This test drive stays on the dashboard.
          </p>
          <button type="button" onClick={() => setNote(null)} aria-label="Close" className="-m-1 rounded-md p-1 hover:bg-night-deep">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </DemoProvider>
  );
}

// Canned answers for the test drive's chat. The real Fisher reads the store's
// own sales and posts; these just show the kind of thing it says.
function reply(text: string) {
  const t = text.toLowerCase();
  if (/start|first|begin/.test(t))
    return "Start with the posts on the left. Tap one to read it, approve the ones you like, and they land on the calendar. Then connect Square in Settings so I can see which posts sold.";
  if (/what do you do|do for me|how does/.test(t))
    return "Every Monday I write a week of posts from your product photos. You approve them in one tap and they go up on their day. Then I check your Square sales to see which posts sold, and make more of those.";
  if (/poster|flyer|sign/.test(t))
    return "Sure. Tell me what it's for (a sale, a new arrival, an event) and the dates, and I'll make a poster you can print or post. In this test drive I can't make the file, but in your account it shows up right here.";
  if (/sell|selling|best|sold/.test(t))
    return "In this sample week the posted items made $880 of $5,240, about 17%. Saturday was the big day. Try-on videos sold the most, so next week has three of them.";
  if (/next week|make.*posts|more posts/.test(t))
    return "Next week's 7 posts are already on the left, waiting on you. Send me new photos any time and I'll swap any of them out.";
  if (/price|cost|how much/.test(t)) return "Plans start at $20 a month, month to month. No contract.";
  return "Got it. In your own account I'd answer from your store's sales and posts. In this test drive, try asking what's selling, or what I do for you.";
}

// A believable month for a small clothing store: last week posted, this week
// approved, next week written and waiting on the owner.
function samplePosts(today: string): Post[] {
  const mon = mondayOf(today);
  const week = (offset: number, rows: [string, string, string, string[]][], status: Post["status"]) =>
    rows.map(([kind, title, hook, items], i): Post => {
      const postOn = addDays(mon, offset * 7 + i);
      return {
        id: `demo-${offset}-${i}`,
        weekOf: addDays(mon, offset * 7),
        position: i + 1,
        day: postOn,
        kind,
        title,
        hook,
        caption: `${hook}\n\nIn the shop now. Come try it on, or call and we'll hold your size.`,
        items,
        mediaPath: null,
        mediaUrl: null,
        isImage: true,
        status: status === "approved" && postOn < today ? "posted" : status,
        postOn,
        campaign: "",
      };
    });

  return [
    ...week(-1, [
      ["new arrival", "Fall knits are in", "Six new sweaters, all under $70.", ["cable knit sweater"]],
      ["try-on", "Three ways to wear the plaid shacket", "One shacket, three outfits.", ["plaid shacket"]],
      ["in the shop", "Saturday at the shop", "Come say hi. Coffee's on us till noon.", []],
      ["gift idea", "Gifts under $30", "For the friend who has everything.", ["candle", "silk scrunchie set"]],
      ["outfit", "Date night, done", "The black midi and gold hoops.", ["black midi dress", "gold hoops"]],
    ], "posted"),
    ...week(0, [
      ["try-on", "The corduroy wide-leg, on three bodies", "Same pants, sizes 2, 10 and 16.", ["corduroy wide-leg pants"]],
      ["behind the scenes", "Unboxing the holiday order", "Forty boxes. We opened them all on camera.", []],
      ["new arrival", "Velvet is back", "The velvet blazer in green and wine.", ["velvet blazer"]],
      ["gift idea", "Stocking stuffers by the register", "Little things, all under $15.", ["lip balm trio", "mini candle"]],
      ["outfit", "Thanksgiving outfit, sorted", "Comfy enough for seconds.", ["sweater dress", "suede boots"]],
    ], "approved"),
    ...week(1, [
      ["try-on", "Sweater dress, three ways", "Boots, sneakers, or tights and flats.", ["sweater dress"]],
      ["new arrival", "Just in: faux fur vests", "Cream and chocolate. Only eight of each.", ["faux fur vest"]],
      ["behind the scenes", "How we pick what we stock", "Every piece gets tried on by the whole team first.", []],
      ["gift idea", "Gifts for mom under $50", "She'll actually wear these.", ["cashmere scarf", "gold hoops"]],
      ["sale", "Small Business Saturday", "20% off one full-price item, Saturday only.", []],
      ["in the shop", "The new window", "Come see it lit up after dark.", []],
      ["outfit", "Holiday party, start to finish", "The velvet blazer with the black midi.", ["velvet blazer", "black midi dress"]],
    ], "draft"),
  ];
}

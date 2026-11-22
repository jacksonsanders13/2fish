import { NextResponse } from "next/server";
import { syncAll } from "@/lib/integrations/square";
import { weeklyAutopilot } from "@/lib/pilot/autopilot";

export const maxDuration = 300;

// Vercel runs this every morning (vercel.json). It sends CRON_SECRET as a bearer token.
// Every day: pull sales from Square. Mondays: the agent also drafts the week's posts.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  }
  const results = await syncAll();
  const packs = new Date().getUTCDay() === 1 ? await weeklyAutopilot() : [];
  return NextResponse.json({ synced: results.length, failed: results.filter((r) => !r.ok).length, packs: packs.filter((p) => p.made).length });
}

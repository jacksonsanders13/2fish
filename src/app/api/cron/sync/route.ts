import { NextResponse } from "next/server";
import { syncAll } from "@/lib/integrations/square";
import { fridayPhotoAsk, weeklyAutopilot } from "@/lib/pilot/autopilot";

export const maxDuration = 300;

// Vercel runs this every morning (vercel.json). It sends CRON_SECRET as a bearer token.
// Every day: pull sales from Square, then the agent drafts posts for stores
// whose pack day it is and asks for photos 3 days before.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  }
  const results = await syncAll();
  const packs = await weeklyAutopilot();
  const asks = await fridayPhotoAsk();
  return NextResponse.json({
    synced: results.length,
    failed: results.filter((r) => !r.ok).length,
    packs: packs.filter((p) => p.made).length,
    photoAsks: asks.filter((a) => a.asked).length,
  });
}

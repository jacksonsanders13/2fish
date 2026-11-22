import { NextResponse } from "next/server";
import { syncAll } from "@/lib/integrations/square";

export const maxDuration = 300;

// Vercel runs this every morning (vercel.json). It sends CRON_SECRET as a bearer token.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  }
  const results = await syncAll();
  return NextResponse.json({ synced: results.length, failed: results.filter((r) => !r.ok).length });
}

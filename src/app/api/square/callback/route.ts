import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureBusiness } from "@/lib/app/queries";
import { connectSquare, syncSquare } from "@/lib/integrations/square";

export const maxDuration = 60;

// Square sends the owner back here. Save the tokens, then pull 90 days of
// history so the "before" number exists on day one.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const back = (s: string) => NextResponse.redirect(`${url.origin}/dashboard/settings?square=${s}`);
  const jar = await cookies();
  const expected = jar.get("2fish_square_state")?.value;
  jar.delete("2fish_square_state");

  const code = url.searchParams.get("code");
  if (!code || !expected || url.searchParams.get("state") !== expected) return back("failed");

  try {
    const { user, business } = await ensureBusiness();
    await connectSquare(code, business.id, user.id);
    await syncSquare(business.id, 90);
    return back("connected");
  } catch (e) {
    console.error("square callback", e);
    return back("failed");
  }
}

import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/app/queries";
import { authorizeUrl, squareReady } from "@/lib/integrations/square";

// Sends the owner to Square to approve read-only access. The state cookie
// stops someone else's Square account being attached through a forged link.
export async function GET(req: Request) {
  await requireUser();
  const origin = new URL(req.url).origin;
  if (!squareReady()) return NextResponse.redirect(`${origin}/dashboard/settings?square=not-set-up`);
  const state = randomBytes(24).toString("hex");
  const res = NextResponse.redirect(authorizeUrl(state)!);
  res.cookies.set("2fish_square_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" });
  return res;
}

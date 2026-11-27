import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/app/queries";
import { igAuthorizeUrl, instagramReady } from "@/lib/integrations/instagram";

// Sends the owner to Instagram to let 2fish post for them. The state cookie
// stops someone else's account being attached through a forged link.
export async function GET(req: Request) {
  await requireUser();
  const origin = new URL(req.url).origin;
  if (!instagramReady()) return NextResponse.redirect(`${origin}/dashboard/settings?instagram=not-set-up`);
  const state = randomBytes(24).toString("hex");
  const res = NextResponse.redirect(igAuthorizeUrl(state, `${origin}/api/instagram/callback`)!);
  res.cookies.set("2fish_ig_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" });
  return res;
}

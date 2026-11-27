import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureBusiness } from "@/lib/app/queries";
import { connectInstagram } from "@/lib/integrations/instagram";

// Instagram sends the owner back here with a code. Save the token.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const back = (s: string) => NextResponse.redirect(`${url.origin}/dashboard/settings?instagram=${s}`);
  const jar = await cookies();
  const expected = jar.get("2fish_ig_state")?.value;
  jar.delete("2fish_ig_state");

  // Instagram sometimes tacks "#_" onto the code.
  const code = url.searchParams.get("code")?.replace(/#_$/, "");
  if (!code || !expected || url.searchParams.get("state") !== expected) return back("failed");

  try {
    const { user, business } = await ensureBusiness();
    await connectInstagram(code, `${url.origin}/api/instagram/callback`, business.id, user.id);
    return back("connected");
  } catch (e) {
    console.error("instagram callback", e);
    return back("failed");
  }
}

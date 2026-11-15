import { NextResponse, type NextRequest } from "next/server";
import { savePlan, takePendingAnswers } from "@/lib/plan/actions";
import { createClient } from "@/lib/supabase/server";

// Where the magic link lands. Swaps the code for a session, saves any audit
// that was waiting on sign-in, then sends the owner on.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "/dashboard";
  const next = nextParam.startsWith("/") ? nextParam : "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing", url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login?error=expired", url.origin));
  }

  const pending = await takePendingAnswers();
  if (pending) {
    try {
      await savePlan(pending);
    } catch {
      // The session is fine even if the save hiccuped. The dashboard will
      // offer the audit again.
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { deleteAccount } from "@/lib/account/delete";

// POST { confirm: "delete my account" }. Verifies the session, then deletes
// with the service role key. The browser never sees that key.
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { confirm?: string } | null;
  if (body?.confirm?.trim().toLowerCase() !== "delete my account") {
    return NextResponse.json({ error: "Type “delete my account” to confirm." }, { status: 400 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Account deletion isn't configured on this server yet. Email us and we'll do it by hand." }, { status: 503 });
  }

  try {
    await deleteAccount(createAdminClient(), user.id);
  } catch (err) {
    console.error("account deletion failed", err);
    return NextResponse.json({ error: "Something went wrong. Nothing was deleted. Try again or email us." }, { status: 500 });
  }
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}

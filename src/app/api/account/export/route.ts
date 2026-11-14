import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// Everything we hold about the signed-in person, as one JSON file.
// Uses their own session, so RLS decides what's included.
export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const [profile, needs, threads, reports, blocks, notifications] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("needs").select("*").eq("poster_id", user.id).order("created_at"),
    supabase.from("threads").select("*").or(`poster_id.eq.${user.id},helper_id.eq.${user.id}`).order("created_at"),
    supabase.from("reports").select("*").eq("reporter_id", user.id).order("created_at"),
    supabase.from("blocks").select("*").eq("blocker_id", user.id),
    supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at"),
  ]);

  const threadIds = (threads.data ?? []).map((t) => t.id);
  const messages = threadIds.length
    ? await supabase.from("messages").select("*").in("thread_id", threadIds).order("created_at")
    : { data: [] };

  const payload = {
    exported_at: new Date().toISOString(),
    account: { id: user.id, email: user.email, created_at: user.created_at, providers: user.app_metadata?.providers ?? [] },
    profile: profile.data,
    needs: needs.data ?? [],
    conversations: (threads.data ?? []).map((t) => ({
      ...t,
      messages: (messages.data ?? []).filter((m) => m.thread_id === t.id),
    })),
    reports_filed: reports.data ?? [],
    blocks: blocks.data ?? [],
    notifications: notifications.data ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="2fish-export-${new Date().toISOString().slice(0, 10)}.json"`,
      "cache-control": "no-store",
    },
  });
}

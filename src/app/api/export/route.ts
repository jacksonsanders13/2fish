import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// "Download my data": everything the owner has in 2fish, as one JSON file.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const tables = ["businesses", "audits", "plans", "plan_steps", "customers", "jobs", "textback_settings", "messages", "events"] as const;
  const out: Record<string, unknown> = { exportedAt: new Date().toISOString(), email: user.email };
  for (const t of tables) {
    const { data } = await supabase.from(t).select("*").eq("owner_id", user.id);
    out[t] = data ?? [];
  }

  return new NextResponse(JSON.stringify(out, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="2fish-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

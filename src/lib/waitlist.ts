"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a real email.").max(200),
  store: z.string().trim().max(120).default(""),
  plan: z.enum(["", "starter", "growth", "pro", "not sure"]).default(""),
  website: z.string().max(0).optional(), // honeypot: people never see it, bots fill it in
});

export async function joinWaitlist(input: z.input<typeof schema>): Promise<{ ok: boolean; message: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    // A filled honeypot gets the same thank-you, so bots learn nothing.
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return { ok: true, message: "You're on the list." };
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const { email, store, plan } = parsed.data;
  const referer = (await headers()).get("referer") ?? "";
  const source = (() => {
    try {
      const u = new URL(referer);
      return [...u.searchParams].filter(([k]) => k.startsWith("utm_")).map(([k, v]) => `${k}=${v}`).join("&").slice(0, 200);
    } catch {
      return "";
    }
  })();

  const supabase = await createClient();
  const { error } = await supabase.from("waitlist").insert({ email, store, plan, source });
  // 23505 = already on the list. Treat it as a success.
  if (error && error.code !== "23505") return { ok: false, message: "That didn't go through. Try again in a minute." };
  return { ok: true, message: "You're on the list. We'll email you when 2fish opens." };
}

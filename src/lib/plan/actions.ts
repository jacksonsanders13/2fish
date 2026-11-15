"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { answersSchema } from "./schema";
import { createClient } from "@/lib/supabase/server";
import { estimate, type Answers } from "./estimate";
import { narrate } from "./narrate";

const PENDING_COOKIE = "2fish_pending_audit";

async function siteOrigin() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

/**
 * Step one of saving a plan when nobody is signed in: stash the answers in a
 * short-lived cookie and email a magic link. The callback route finishes the job.
 */
export async function requestMagicLink(input: { email: string; answers?: Answers; next?: string }) {
  const email = z.string().email().parse(input.email.trim().toLowerCase());
  const next = input.next && input.next.startsWith("/") ? input.next : "/dashboard";

  if (input.answers) {
    const answers = answersSchema.parse(input.answers);
    const jar = await cookies();
    jar.set(PENDING_COOKIE, JSON.stringify(answers), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60,
      path: "/",
    });
  }

  const supabase = await createClient();
  const origin = await siteOrigin();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const };
}

/** Read and clear the answers stashed before the magic link went out. */
export async function takePendingAnswers(): Promise<Answers | null> {
  const jar = await cookies();
  const raw = jar.get(PENDING_COOKIE)?.value;
  if (!raw) return null;
  jar.delete(PENDING_COOKIE);
  try {
    return answersSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * Turn a set of answers into a saved plan for the signed-in user. Creates the
 * business row the first time. Returns the new plan id.
 */
export async function savePlan(input: Answers) {
  const answers = answersSchema.parse(input);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/results");

  const est = estimate(answers);
  const words = await narrate(est, answers);

  let { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).maybeSingle();
  if (!business) {
    const created = await supabase
      .from("businesses")
      .insert({ owner_id: user.id, kind: answers.type })
      .select("id")
      .single();
    if (created.error) throw created.error;
    business = created.data;
  }

  const audit = await supabase
    .from("audits")
    .insert({ business_id: business.id, owner_id: user.id, answers })
    .select("id")
    .single();
  if (audit.error) throw audit.error;

  const plan = await supabase
    .from("plans")
    .insert({
      audit_id: audit.data.id,
      business_id: business.id,
      owner_id: user.id,
      total_monthly: est.totalMonthly,
      leaks: est.leaks,
      summary: words.summary,
      model: words.model,
    })
    .select("id")
    .single();
  if (plan.error) throw plan.error;

  const steps = await supabase.from("plan_steps").insert(
    est.steps.map((s) => ({
      plan_id: plan.data.id,
      owner_id: user.id,
      rank: s.rank,
      key: s.key,
      title: s.title,
      detail: words.details[s.key] ?? s.detail,
      impact_monthly: s.impact,
      status: s.status,
      href: s.href,
    })),
  );
  if (steps.error) throw steps.error;

  return plan.data.id;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

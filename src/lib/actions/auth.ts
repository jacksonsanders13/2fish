"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SITE } from "@/lib/site";
import { fail, keepValues, type ActionResult } from "@/lib/action-result";
import {
  loginSchema,
  magicLinkSchema,
  resetPasswordSchema,
  safeNext,
  signupSchema,
} from "@/lib/validation/auth";

const NOT_CONFIGURED = "Sign-in isn't set up yet. The site owner needs to add the Supabase keys.";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url;
}

export async function signInWithPassword(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail(NOT_CONFIGURED);
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) {
    return fail("Check the fields below.", { fieldErrors: z.flattenError(parsed.error).fieldErrors, values: keepValues(formData, ["email"]) });
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    const msg =
      error.code === "email_not_confirmed"
        ? "Confirm your email first. Check your inbox for the link we sent."
        : "That email and password don't match.";
    return fail(msg, { values: keepValues(formData, ["email"]) });
  }
  redirect(safeNext(formData.get("next")));
}

export async function signUp(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail(NOT_CONFIGURED);
  const parsed = signupSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
    over18: formData.get("over18"),
  });
  if (!parsed.success) {
    return fail("Check the fields below.", {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values: keepValues(formData, ["displayName", "email"]),
    });
  }
  const { email, password, displayName } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback?next=/onboarding`,
      data: { display_name: displayName, terms_accepted: "true" },
    },
  });
  if (error) {
    const msg =
      error.code === "user_already_exists" || /already registered/i.test(error.message)
        ? "There's already an account with that email. Try signing in."
        : error.message;
    return fail(msg, { values: keepValues(formData, ["displayName", "email"]) });
  }
  // Email confirmation on: no session yet. Off: signed in already.
  if (!data.session) redirect(`/check-email?email=${encodeURIComponent(email)}&kind=confirm`);
  redirect("/onboarding");
}

export async function sendMagicLink(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail(NOT_CONFIGURED);
  const parsed = magicLinkSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return fail("Enter a valid email address.", { fieldErrors: z.flattenError(parsed.error).fieldErrors });
  }
  const next = safeNext(formData.get("next"));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      // magic links are for people who already have an account; new accounts go through /signup
      shouldCreateUser: false,
      emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) {
    if (/signups not allowed|not found/i.test(error.message)) {
      return fail("We couldn't find an account with that email. Create one first.");
    }
    return fail(error.message);
  }
  redirect(`/check-email?email=${encodeURIComponent(parsed.data.email)}&kind=magic`);
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured()) redirect("/login?error=" + encodeURIComponent(NOT_CONFIGURED));
  const next = safeNext(formData.get("next"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) {
    redirect("/login?error=" + encodeURIComponent("Google sign-in isn't available right now."));
  }
  redirect(data.url);
}

export async function forgotPassword(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail(NOT_CONFIGURED);
  const parsed = magicLinkSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return fail("Enter a valid email address.", { fieldErrors: z.flattenError(parsed.error).fieldErrors });
  }
  const supabase = await createClient();
  // Always report success so this can't be used to check whether an email has an account.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl()}/auth/callback?next=/reset-password`,
  });
  redirect(`/check-email?email=${encodeURIComponent(parsed.data.email)}&kind=reset`);
}

export async function resetPassword(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail(NOT_CONFIGURED);
  const parsed = resetPasswordSchema.safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) {
    return fail("Check the fields below.", { fieldErrors: z.flattenError(parsed.error).fieldErrors });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("That reset link has expired. Request a new one.");
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return fail(error.message);
  redirect("/dashboard?reset=1");
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

export async function resendConfirmation(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail(NOT_CONFIGURED);
  const parsed = magicLinkSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return fail("Enter a valid email address.");
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: `${siteUrl()}/auth/callback?next=/onboarding` },
  });
  if (error) return fail(error.message);
  return { ok: true, message: "Sent. Give it a minute and check spam too." };
}

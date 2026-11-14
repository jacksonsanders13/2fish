"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/server";
import { fail, type ActionResult } from "@/lib/action-result";
import { changeEmailSchema, changePasswordSchema } from "@/lib/validation/auth";
import { extensionFor } from "@/lib/storage";
import { SITE } from "@/lib/site";

const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR = 2 * 1024 * 1024;

export async function uploadAvatar(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireUser("/settings");
  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) return fail("Pick a photo first.");
  if (!AVATAR_TYPES.includes(file.type)) return fail("Use a JPG, PNG or WebP.");
  if (file.size > MAX_AVATAR) return fail("That photo is over 2 MB. Try a smaller one.");

  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle();
  const path = `${user.id}/${randomUUID()}.${extensionFor(file.type)}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type });
  if (error) return fail("Couldn't upload that. Try again in a moment.");
  const { error: dbError } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", user.id);
  if (dbError) return fail("Couldn't save that. Try again in a moment.");
  if (profile?.avatar_url) await supabase.storage.from("avatars").remove([profile.avatar_url]);
  revalidatePath("/", "layout");
  return { ok: true, message: "Photo updated." };
}

export async function removeAvatar(): Promise<ActionResult> {
  const user = await requireUser("/settings");
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle();
  await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
  if (profile?.avatar_url) await supabase.storage.from("avatars").remove([profile.avatar_url]);
  revalidatePath("/", "layout");
  return { ok: true, message: "Photo removed." };
}

export async function setEmailNotifications(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireUser("/settings");
  const on = formData.get("emailNotifications") === "on";
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ email_notifications: on }).eq("id", user.id);
  if (error) return fail("Couldn't save that.");
  revalidatePath("/settings");
  return { ok: true, message: on ? "Email notifications are on." : "Email notifications are off. You'll still see them in the app." };
}

export async function changeEmail(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireUser("/settings/account");
  const parsed = changeEmailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return fail("Enter a valid email address.", { fieldErrors: z.flattenError(parsed.error).fieldErrors });
  const supabase = await createClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url;
  const { error } = await supabase.auth.updateUser(
    { email: parsed.data.email },
    { emailRedirectTo: `${site}/auth/callback?next=/settings/account?emailChanged=1` },
  );
  if (error) return fail(error.message);
  return { ok: true, message: `Check ${parsed.data.email} for a confirmation link. Your email changes once you click it.` };
}

export async function changePassword(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireUser("/settings/account");
  const parsed = changePasswordSchema.safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) return fail("Check the fields below.", { fieldErrors: z.flattenError(parsed.error).fieldErrors });
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return fail(error.message);
  return { ok: true, message: "Password updated." };
}

export async function linkGoogle(): Promise<void> {
  await requireUser("/settings/account");
  const supabase = await createClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url;
  const { data, error } = await supabase.auth.linkIdentity({
    provider: "google",
    options: { redirectTo: `${site}/auth/callback?next=/settings/account` },
  });
  if (error || !data.url) {
    redirect(`/settings/account?error=${encodeURIComponent("Couldn't start Google linking. Make sure Google sign-in is enabled.")}`);
  }
  redirect(data.url);
}

export async function unlinkGoogle(): Promise<ActionResult> {
  await requireUser("/settings/account");
  const supabase = await createClient();
  const { data } = await supabase.auth.getUserIdentities();
  const google = data?.identities.find((i) => i.provider === "google");
  if (!google) return fail("Google isn't connected.");
  if ((data?.identities.length ?? 0) < 2) return fail("Add a password first so you can still sign in.");
  const { error } = await supabase.auth.unlinkIdentity(google);
  if (error) return fail(error.message);
  revalidatePath("/settings/account");
  return { ok: true, message: "Google disconnected." };
}

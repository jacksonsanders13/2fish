"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfile, requireUser } from "@/lib/auth/server";
import { lookupZip } from "@/lib/zips";
import { fail, keepValues, type ActionResult } from "@/lib/action-result";
import { onboardingSchema, profileSchema } from "@/lib/validation/profile";
import { safeNext } from "@/lib/validation/auth";

export async function completeOnboarding(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireUser("/onboarding");
  const profile = await getProfile();
  if (!profile) return fail("We couldn't find your profile. Try signing in again.");

  const parsed = onboardingSchema.safeParse({
    displayName: formData.get("displayName"),
    area: formData.get("area") ?? "",
    zip: formData.get("zip"),
    over18: formData.get("over18") ?? undefined,
  });
  if (!parsed.success) {
    return fail("Check the fields below.", {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values: keepValues(formData, ["displayName", "area", "zip"]),
    });
  }
  if (!profile.terms_accepted_at && parsed.data.over18 !== "on") {
    return fail("Check the fields below.", {
      fieldErrors: { over18: ["You need to be 18 or older to use 2fish."] },
      values: keepValues(formData, ["displayName", "area", "zip"]),
    });
  }
  const point = lookupZip(parsed.data.zip);
  if (!point) {
    return fail("Check the fields below.", {
      fieldErrors: { zip: ["We don't recognize that ZIP code. Double-check it."] },
      values: keepValues(formData, ["displayName", "area", "zip"]),
    });
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      area: parsed.data.area || null,
      zip: parsed.data.zip,
      lat: point.lat,
      lng: point.lng,
      terms_accepted_at: profile.terms_accepted_at ?? now,
      onboarded_at: profile.onboarded_at ?? now,
    })
    .eq("id", user.id);
  if (error) return fail("Couldn't save that. Try again in a moment.");

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function updateProfile(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireUser("/settings");
  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    area: formData.get("area") ?? "",
    bio: formData.get("bio") ?? "",
    zip: formData.get("zip"),
  });
  if (!parsed.success) {
    return fail("Check the fields below.", {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values: keepValues(formData, ["displayName", "area", "bio", "zip"]),
    });
  }
  const point = lookupZip(parsed.data.zip);
  if (!point) {
    return fail("Check the fields below.", {
      fieldErrors: { zip: ["We don't recognize that ZIP code. Double-check it."] },
      values: keepValues(formData, ["displayName", "area", "bio", "zip"]),
    });
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      area: parsed.data.area || null,
      bio: parsed.data.bio || null,
      zip: parsed.data.zip,
      lat: point.lat,
      lng: point.lng,
    })
    .eq("id", user.id);
  if (error) return fail("Couldn't save that. Try again in a moment.");
  revalidatePath("/", "layout");
  return { ok: true, message: "Profile saved." };
}

import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ProfileRow } from "@/lib/supabase/database.types";

export type SessionUser = { id: string; email: string | null };

// The signed-in auth user, or null. Cached per request.
export const getUser = cache(async (): Promise<SessionUser | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { id: user.id, email: user.email ?? null } : null;
});

export const getProfile = cache(async (): Promise<ProfileRow | null> => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data ?? null;
});

// What the header needs. Small on purpose.
export type HeaderUser = { id: string; displayName: string; avatarUrl: string | null; isAdmin: boolean };
export const getHeaderUser = cache(async (): Promise<HeaderUser | null> => {
  const p = await getProfile();
  if (!p) return null;
  return { id: p.id, displayName: p.display_name, avatarUrl: p.avatar_url, isAdmin: p.role === "admin" };
});

export async function requireUser(next?: string): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return user;
}

// Signed in AND finished onboarding (ZIP set, terms accepted). Otherwise send them there.
export async function requireProfile(next?: string): Promise<ProfileRow> {
  const user = await requireUser(next);
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.banned_at) redirect("/banned");
  if (!profile.onboarded_at || !profile.terms_accepted_at || !profile.zip) {
    redirect(`/onboarding${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  }
  void user;
  return profile;
}

export async function requireAdmin(): Promise<ProfileRow> {
  const profile = await requireProfile("/admin");
  if (profile.role !== "admin") redirect("/dashboard");
  return profile;
}

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { publicUrl } from "@/lib/storage";
import type { NeedCardData } from "@/components/needs/need-card";
import type { NearbyNeedRow, NeedRow, PublicProfileRow } from "@/lib/supabase/database.types";
import { CATEGORIES, URGENCIES, type Category, type Urgency } from "./constants";

export type FeedParams = {
  lat?: number | null;
  lng?: number | null;
  radius?: number | null;
  category?: string | null;
  urgency?: string | null;
  q?: string | null;
  page?: number;
  pageSize?: number;
};

export function toCard(row: NearbyNeedRow): NeedCardData {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    urgency: row.urgency,
    status: row.status,
    fulfillment: row.fulfillment,
    createdAt: row.created_at,
    distanceMiles: row.distance_miles,
    photoUrl: publicUrl("need-photos", row.photo_path),
    poster: { displayName: row.poster_name, avatarUrl: publicUrl("avatars", row.poster_avatar), area: row.poster_area },
  };
}

export async function fetchFeed(params: FeedParams) {
  const supabase = await createClient();
  const pageSize = params.pageSize ?? 24;
  const page = Math.max(1, params.page ?? 1);
  const category = CATEGORIES.includes(params.category as Category) ? (params.category as Category) : null;
  const urgency = URGENCIES.includes(params.urgency as Urgency) ? (params.urgency as Urgency) : null;

  const { data, error } = await supabase.rpc("nearby_needs", {
    p_lat: params.lat ?? null,
    p_lng: params.lng ?? null,
    p_radius_miles: params.lat != null && params.lng != null ? (params.radius ?? null) : null,
    p_category: category,
    p_urgency: urgency,
    p_query: params.q?.trim() || null,
    p_limit: pageSize,
    p_offset: (page - 1) * pageSize,
  });
  if (error) throw error;
  const rows = (data ?? []) as NearbyNeedRow[];
  const total = rows[0]?.total_count ? Number(rows[0].total_count) : 0;
  return { items: rows.map(toCard), total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export type NeedDetail = NeedRow & {
  poster: PublicProfileRow | null;
  helper: PublicProfileRow | null;
  photoUrl: string | null;
};

export async function fetchNeed(id: string): Promise<NeedDetail | null> {
  const supabase = await createClient();
  const { data: need } = await supabase.from("needs").select("*").eq("id", id).maybeSingle();
  if (!need) return null;
  const ids = [need.poster_id, need.helper_id].filter(Boolean) as string[];
  const { data: people } = await supabase.from("public_profiles").select("*").in("id", ids);
  const byId = new Map((people ?? []).map((p) => [p.id, p]));
  return {
    ...need,
    poster: byId.get(need.poster_id) ?? null,
    helper: need.helper_id ? (byId.get(need.helper_id) ?? null) : null,
    photoUrl: publicUrl("need-photos", need.photo_path),
  };
}

// Needs a signed-in person posted or is helping with (RLS already limits what's visible).
export async function fetchMyNeeds(userId: string) {
  const supabase = await createClient();
  const [{ data: mine }, { data: helping }] = await Promise.all([
    supabase.from("needs").select("*").eq("poster_id", userId).order("created_at", { ascending: false }),
    supabase.from("needs").select("*").eq("helper_id", userId).order("pledged_at", { ascending: false }),
  ]);
  const posterIds = Array.from(new Set((helping ?? []).map((n) => n.poster_id)));
  const { data: posters } = posterIds.length
    ? await supabase.from("public_profiles").select("*").in("id", posterIds)
    : { data: [] as PublicProfileRow[] };
  const byId = new Map((posters ?? []).map((p) => [p.id, p]));
  return {
    mine: (mine ?? []).map((n) => ({ ...n, photoUrl: publicUrl("need-photos", n.photo_path) })),
    helping: (helping ?? []).map((n) => ({
      ...n,
      photoUrl: publicUrl("need-photos", n.photo_path),
      poster: byId.get(n.poster_id) ?? null,
    })),
  };
}

export function rowToCard(n: NeedRow & { photoUrl?: string | null }, poster: { displayName: string; avatarUrl?: string | null; area?: string | null }): NeedCardData {
  return {
    id: n.id,
    title: n.title,
    description: n.description,
    category: n.category,
    urgency: n.urgency,
    status: n.status,
    fulfillment: n.fulfillment,
    createdAt: n.created_at,
    photoUrl: n.photoUrl ?? publicUrl("need-photos", n.photo_path),
    poster,
  };
}

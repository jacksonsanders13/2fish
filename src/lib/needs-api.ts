// Everything that talks to the `needs` table lives here.
// Table + rules: supabase/migrations/20261109000000_create_needs.sql

import type { Category } from "./categories";
import { supabase } from "./supabase";
import type { HelpMethod, Need, Status } from "./types";

type Row = {
  id: string;
  poster_id: string;
  title: string;
  category: Category;
  story: string;
  zip: string;
  area: string;
  display_name: string;
  needed_by: string | null;
  in_person: boolean;
  meet_spot: string;
  wishlist_url: string;
  status: Status;
  helper_id: string | null;
  helper_method: HelpMethod | null;
  helper_note: string;
  created_at: string;
};

export type NewNeed = Omit<Need, "id" | "posterId" | "status" | "createdAt" | "helper" | "example">;

export function fromRow(r: Row): Need {
  return {
    id: r.id,
    posterId: r.poster_id,
    title: r.title,
    category: r.category,
    story: r.story,
    zip: r.zip,
    area: r.area,
    displayName: r.display_name,
    neededBy: r.needed_by ?? "",
    inPerson: r.in_person,
    meetSpot: r.meet_spot,
    wishlistUrl: r.wishlist_url,
    status: r.status,
    helper: r.helper_id && r.helper_method ? { id: r.helper_id, method: r.helper_method, note: r.helper_note } : undefined,
    createdAt: new Date(r.created_at).getTime(),
  };
}

// Turns a database error into something a person can read.
function fail(error: { message: string } | null): never {
  throw new Error(error?.message || "Something went wrong. Please try again.");
}

// Signs the browser in anonymously the first time, so people can post and
// help without making an account. Returns the user id.
export async function ensureUser(): Promise<string> {
  const auth = supabase().auth;
  const { data } = await auth.getSession();
  if (data.session) return data.session.user.id;
  const { data: signedIn, error } = await auth.signInAnonymously();
  if (error || !signedIn.user) fail(error);
  return signedIn.user.id;
}

export async function fetchNeeds(): Promise<Need[]> {
  const { data, error } = await supabase().from("needs").select("*").order("created_at", { ascending: false }).limit(300);
  if (error) fail(error);
  return (data as Row[]).map(fromRow);
}

export async function createNeed(n: NewNeed): Promise<Need> {
  const { data, error } = await supabase()
    .from("needs")
    .insert({
      title: n.title,
      category: n.category,
      story: n.story,
      zip: n.zip,
      area: n.area,
      display_name: n.displayName,
      needed_by: n.neededBy || null,
      in_person: n.inPerson,
      meet_spot: n.meetSpot,
      wishlist_url: n.wishlistUrl,
    })
    .select()
    .single();
  if (error) fail(error);
  return fromRow(data as Row);
}

export async function deleteNeed(id: string): Promise<void> {
  const { error } = await supabase().from("needs").delete().eq("id", id);
  if (error) fail(error);
}

async function rpc(fn: string, args: Record<string, unknown>): Promise<Need> {
  const { data, error } = await supabase().rpc(fn, args);
  if (error) fail(error);
  return fromRow(data as Row);
}

export const pledgeNeed = (id: string, method: HelpMethod, note: string) => rpc("pledge_need", { need_id: id, method, note });
export const cancelPledge = (id: string) => rpc("cancel_pledge", { need_id: id });
export const markReceived = (id: string) => rpc("mark_received", { need_id: id });

// Calls onChange whenever anyone adds, changes or removes a need.
export function watchNeeds(onChange: () => void): () => void {
  const channel = supabase()
    .channel("needs-feed")
    .on("postgres_changes", { event: "*", schema: "public", table: "needs" }, onChange)
    .subscribe();
  return () => {
    supabase().removeChannel(channel);
  };
}

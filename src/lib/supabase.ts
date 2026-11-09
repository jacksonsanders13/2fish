import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Set these in .env.local (see .env.example). When they're missing the app
// runs on example data in memory instead, like before.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(url && key);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!url || !key) throw new Error("Supabase isn't configured. Add the keys to .env.local.");
  client ??= createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return client;
}

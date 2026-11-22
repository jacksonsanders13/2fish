import { createClient } from "@supabase/supabase-js";

// Server-only client with the secret key. It skips row-level security, so only
// use it for things owners must never touch directly (Square tokens, the daily sync).
export function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

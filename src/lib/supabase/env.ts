export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

// True once .env.local has the Supabase keys. Lets the site render before setup.
export const isSupabaseConfigured = () => supabaseEnv() !== null;

import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

// For Server Components, Server Actions and Route Handlers.
export async function createClient() {
  const env = supabaseEnv();
  if (!env) {
    throw new Error("Supabase isn't configured. Copy .env.example to .env.local and fill in the keys.");
  }
  const cookieStore = await cookies();

  return createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies can't be written.
          // proxy.ts refreshes the session on the next request instead.
        }
      },
    },
  });
}

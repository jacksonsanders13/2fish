import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side client for server components, actions and route handlers.
// Reads the session from cookies; writes are a no-op in server components,
// which is fine because proxy.ts keeps the session fresh.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a server component. Safe to ignore.
        }
      },
    },
  });
}

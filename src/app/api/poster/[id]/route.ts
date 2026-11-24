import { createClient } from "@/lib/supabase/server";
import { posterSpec } from "@/lib/skills/poster";
import { renderPoster } from "@/lib/skills/render-poster";

export const runtime = "nodejs";

// Shows one of Fisher's posters as a PNG. The owner's session decides access
// (row-level security), so nobody can open another store's poster.
// Add ?download=1 to save it as a file.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });

  const supabase = await createClient();
  const { data: row } = await supabase.from("posters").select("spec, media_path, business_id").eq("id", id).maybeSingle();
  if (!row) return new Response("Not found", { status: 404 });
  const parsed = posterSpec.safeParse(row.spec);
  if (!parsed.success) return new Response("Bad poster", { status: 500 });

  let photo: string | null = null;
  if (row.media_path) {
    const { data } = await supabase.storage.from("clips").createSignedUrl(row.media_path as string, 300);
    photo = data?.signedUrl ?? null;
  }
  const { data: biz } = await supabase.from("businesses").select("name").eq("id", row.business_id as string).maybeSingle();

  const res = await renderPoster({ spec: parsed.data, photo, store: String(biz?.name ?? "") });
  const headers = new Headers(res.headers);
  headers.set("Cache-Control", "private, max-age=300");
  if (new URL(request.url).searchParams.get("download")) headers.set("Content-Disposition", `attachment; filename="poster-${id.slice(0, 8)}.png"`);
  return new Response(res.body, { status: res.status, headers });
}

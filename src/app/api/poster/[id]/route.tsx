import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { PALETTES, POSTER_SIZE, posterSpec } from "@/lib/skills/poster";

export const runtime = "nodejs";

// Draws one of Fisher's posters as a PNG. The owner's session decides access
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
  const p = parsed.data;
  const c = PALETTES[p.palette];

  let photo: string | null = null;
  if (row.media_path) {
    const { data } = await supabase.storage.from("clips").createSignedUrl(row.media_path as string, 300);
    photo = data?.signedUrl ?? null;
  }
  const layout = photo ? p.layout : "type";
  const { data: biz } = await supabase.from("businesses").select("name").eq("id", row.business_id as string).maybeSingle();
  const store = String(biz?.name ?? "").slice(0, 40);

  const dir = join(process.cwd(), "assets", "fonts");
  const [display, body, bodyBold] = await Promise.all([
    readFile(join(dir, "Calistoga-Regular.ttf")),
    readFile(join(dir, "IBMPlexSans-Regular.ttf")),
    readFile(join(dir, "IBMPlexSans-SemiBold.ttf")),
  ]);

  const words = (big: number) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ fontFamily: "Calistoga", fontSize: big, lineHeight: 1.02, color: c.fg }}>{p.headline}</div>
      {p.subline ? <div style={{ fontFamily: "Plex", fontSize: 40, lineHeight: 1.3, color: c.fg }}>{p.subline}</div> : null}
      {p.details ? (
        <div style={{ display: "flex", fontFamily: "Plex", fontWeight: 600, fontSize: 34, color: c.bg, backgroundColor: c.accent, padding: "10px 20px", borderRadius: 6, alignSelf: "flex-start" }}>
          {p.details}
        </div>
      ) : null}
    </div>
  );

  const size = (n: number) => (p.headline.length > 30 ? Math.round(n * 0.78) : n);

  const page =
    layout === "photo" && photo ? (
      <div style={{ display: "flex", position: "relative", flexDirection: "column", width: "100%", height: "100%", backgroundColor: c.bg }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" width={1080} height={860} style={{ width: 1080, height: 860, objectFit: "cover" }} />
        <div style={{ display: "flex", flex: 1, padding: "48px 72px", alignItems: "center", justifyContent: "space-between" }}>
          {words(size(96))}
        </div>
        {store ? <div style={{ position: "absolute", right: 48, top: 40, fontFamily: "Plex", fontWeight: 600, fontSize: 30, color: "#0f1f20", backgroundColor: "#ffffff", padding: "8px 16px", borderRadius: 6 }}>{store}</div> : null}
      </div>
    ) : layout === "split" && photo ? (
      <div style={{ display: "flex", width: "100%", height: "100%", backgroundColor: c.bg }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" width={540} height={1350} style={{ width: 540, height: 1350, objectFit: "cover" }} />
        <div style={{ display: "flex", width: 540, padding: "72px 56px", alignItems: "center" }}>{words(size(84))}</div>
      </div>
    ) : (
      <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", backgroundColor: c.bg, padding: "120px 96px", alignItems: "center" }}>
        {words(size(150))}
        {store ? <div style={{ position: "absolute", left: 96, bottom: 72, fontFamily: "Plex", fontWeight: 600, fontSize: 34, color: c.fg }}>{store}</div> : null}
      </div>
    );

  const res = new ImageResponse(page, {
    ...POSTER_SIZE,
    fonts: [
      { name: "Calistoga", data: display, weight: 400, style: "normal" },
      { name: "Plex", data: body, weight: 400, style: "normal" },
      { name: "Plex", data: bodyBold, weight: 600, style: "normal" },
    ],
  });
  const headers = new Headers(res.headers);
  headers.set("Cache-Control", "private, max-age=300");
  if (new URL(request.url).searchParams.get("download")) headers.set("Content-Disposition", `attachment; filename="poster-${id.slice(0, 8)}.png"`);
  return new Response(res.body, { status: res.status, headers });
}

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { PALETTES, POSTER_SIZE, type PosterSpec } from "./poster";

// Draws one of Fisher's posters as a PNG at Instagram's 4:5 size.
// Used by the poster route (to show it) and by the poster specialist
// (to save it as the photo on a draft post).
export async function renderPoster({ spec: p, photo, store }: { spec: PosterSpec; photo: string | null; store: string }): Promise<ImageResponse> {
  const c = PALETTES[p.palette];
  const layout = photo ? p.layout : "type";

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
  const name = store.slice(0, 40);

  const page =
    layout === "photo" && photo ? (
      <div style={{ display: "flex", position: "relative", flexDirection: "column", width: "100%", height: "100%", backgroundColor: c.bg }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" width={1080} height={860} style={{ width: 1080, height: 860, objectFit: "cover" }} />
        <div style={{ display: "flex", flex: 1, padding: "48px 72px", alignItems: "center" }}>{words(size(96))}</div>
        {name ? (
          <div style={{ position: "absolute", right: 48, top: 40, fontFamily: "Plex", fontWeight: 600, fontSize: 30, color: "#0f1f20", backgroundColor: "#ffffff", padding: "8px 16px", borderRadius: 6 }}>{name}</div>
        ) : null}
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
        {name ? <div style={{ position: "absolute", left: 96, bottom: 72, fontFamily: "Plex", fontWeight: 600, fontSize: 34, color: c.fg }}>{name}</div> : null}
      </div>
    );

  return new ImageResponse(page, {
    ...POSTER_SIZE,
    fonts: [
      { name: "Calistoga", data: display, weight: 400, style: "normal" },
      { name: "Plex", data: body, weight: 400, style: "normal" },
      { name: "Plex", data: bodyBold, weight: 600, style: "normal" },
    ],
  });
}

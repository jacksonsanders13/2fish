import { ImageResponse } from "next/og";
import { LOGO_PATH, LOGO_VIEWBOX } from "@/components/brand/logo-path";

export const alt = "2fish · A little is enough";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(180deg, #fbf6ec 0%, #fcfbfa 60%)",
          color: "#1c1917",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="72" height="56" viewBox={LOGO_VIEWBOX}>
            <path fill="#e8a33d" fillRule="evenodd" d={LOGO_PATH} />
          </svg>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>2fish</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -3, lineHeight: 1.02, maxWidth: 1000 }}>
            Neighbors helping neighbors, one specific need at a time.
          </div>
          <div style={{ fontSize: 30, color: "#78716c" }}>Post what you need. Someone nearby covers it. Free, private, no fundraising.</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#a16207" }}>
          <span>A little is enough.</span>
          <span style={{ color: "#78716c" }}>join2fish.com</span>
        </div>
      </div>
    ),
    size,
  );
}

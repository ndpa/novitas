import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "ALLE JAHRE WIEDER - Novitas Weihnachtsfeier 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Link preview for WhatsApp, Teams, Mail etc.: the glowing tree beside the headline.
export default async function OpengraphImage() {
  // Same headline font as the page: its I has no crossbars
  const openSans = await readFile(join(process.cwd(), "app/invite/OpenSans-Bold.ttf"));
  const rows = 46;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#1B060B", color: "#D8895F", fontFamily: "Open Sans" }}>
        <div style={{ width: 520, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 60 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: "#FFF1D6", boxShadow: "0 0 40px 16px rgba(247,214,142,0.6)", marginBottom: 12 }} />
          {Array.from({ length: rows }, (_, i) => {
            const t = i / (rows - 1);
            const light = Math.round(238 - 90 * t);
            return (
              <div
                key={i}
                style={{
                  width: 12 + 380 * t,
                  height: 2,
                  marginTop: 9,
                  background: `linear-gradient(90deg, rgba(240,${light},120,0), rgba(250,${light + 10},150,${1 - 0.45 * t}), rgba(240,${light},120,0))`,
                }}
              />
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 96, lineHeight: 1.05, letterSpacing: 2 }}>
            <span>ALLE JAHRE</span>
            <span>WIEDER</span>
          </div>
          <div style={{ fontSize: 30, color: "#F2D3A8" }}>Novitas Weihnachtsfeier</div>
          <div style={{ fontSize: 26, opacity: 0.85 }}>10. Dezember 2026 · 18:30 Uhr · Ammersbek</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Open Sans", data: openSans, weight: 700, style: "normal" }] }
  );
}

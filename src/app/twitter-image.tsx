import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Guil Maueler | Fractional Design Partner";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: "72px",
            fontWeight: 700,
            color: "#fafafa",
            lineHeight: 1.15,
            marginBottom: "32px",
            maxWidth: "900px",
          }}
        >
          Guil Maueler
        </div>
        <div
          style={{
            fontSize: "32px",
            fontWeight: 400,
            color: "#8a8a8a",
            lineHeight: 1.4,
            maxWidth: "800px",
          }}
        >
          Fractional Design Partner for early-stage teams shipping tech for good.
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "80px",
            fontSize: "20px",
            color: "#666666",
            letterSpacing: "2px",
            textTransform: "uppercase" as const,
          }}
        >
          guil.is
        </div>
      </div>
    ),
    { ...size },
  );
}

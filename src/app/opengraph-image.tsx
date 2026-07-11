import { ImageResponse } from "next/og";

export const alt =
  "LICS — Lab for Informatics, Communications, and Systems, Korea University";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F7F4EF",
          color: "#302A25",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: "0.24em",
            color: "#8C1D2B",
            fontWeight: 600,
          }}
        >
          KOREA UNIVERSITY · SCHOOL OF ELECTRICAL ENGINEERING
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 150,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            LICS
            <span style={{ color: "#8C1D2B" }}>.</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#5B534C",
            }}
          >
            Lab for Informatics, Communications &amp; Systems
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: "0.14em",
            color: "#8A8078",
            fontWeight: 500,
          }}
        >
          WIRELESS · NETWORKS · OPTIMIZATION · LEARNING
        </div>
      </div>
    ),
    { ...size }
  );
}

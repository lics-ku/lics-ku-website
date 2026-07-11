import { ImageResponse } from "next/og";

// Crimson "L." mark — the wordmark's identity at favicon scale, derived from
// the crimson LICS logo (public/logo.png).
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#8C1D2B",
          color: "#F7F4EF",
          fontSize: 42,
          fontWeight: 800,
          letterSpacing: "-0.05em",
          borderRadius: 14,
        }}
      >
        L
        <span style={{ color: "#F0B9BE", marginLeft: -2 }}>.</span>
      </div>
    ),
    { ...size }
  );
}

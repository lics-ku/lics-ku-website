import localFont from "next/font/local";

/**
 * Pretendard Variable — self-hosted (src/fonts/PretendardVariable.woff2).
 * Covers Korean + Latin with a full weight axis; the display voice of the site.
 * Exposed as the `--font-sans` custom property consumed by Tailwind's theme.
 */
export const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  display: "swap",
  variable: "--font-sans",
  weight: "45 920",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "system-ui",
    "Segoe UI",
    "Apple SD Gothic Neo",
    "Malgun Gothic",
    "sans-serif",
  ],
});

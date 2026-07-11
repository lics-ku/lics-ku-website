import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // publications.json is read at request time via fs; make sure Vercel's
  // serverless bundle includes it even when no page statically imports it.
  outputFileTracingIncludes: {
    "/publications": ["./data/publications/publications.json"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    domains: ["localhost", "127.0.0.1"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

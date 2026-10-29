import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: "security",
  },
  output: 'standalone',
  // Ensure the hero images are traced into the server bundle so the daily
  // rotation can read public/hero at runtime (e.g. on Vercel serverless).
  outputFileTracingIncludes: {
    '/': ['./public/hero/**'],
  },
  images: {
    // Only the local integration fixture needs the optimizer to reach loopback.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development" && !!process.env.R2_LOCAL_ENDPOINT,
    remotePatterns: [
      ...(process.env.R2_PUBLIC_URL ? [new URL(`${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/photos/images/**`)] : []),
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "private, no-store" }] },
    ];
  },
};

export default nextConfig;

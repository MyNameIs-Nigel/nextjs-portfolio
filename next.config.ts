import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Ensure the hero images are traced into the server bundle so the daily
  // rotation can read public/hero at runtime (e.g. on Vercel serverless).
  outputFileTracingIncludes: {
    '/': ['./public/hero/**'],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;

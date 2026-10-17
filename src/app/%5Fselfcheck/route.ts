import { timingSafeEqual } from "node:crypto";
import { privateJson } from "@/lib/http";

// The folder is `%5Fselfcheck` because `_folders` are private in the App Router;
// this one is served at /_selfcheck.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SERVICE = "nextjs-portfolio";

function getVersion(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_COMMIT_SHA;
  return sha ? sha.slice(0, 7) : "dev";
}

function isAuthed(req: Request): boolean {
  const token = process.env.SELFCHECK_TOKEN;
  if (!token) return false;
  const header = req.headers.get("authorization") ?? "";
  const provided = header.replace(/^Bearer\s+/i, "").trim();
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  const base = {
    status: "ok" as const,
    service: SERVICE,
    version: getVersion(),
    timestamp: new Date().toISOString(),
  };

  if (!isAuthed(req)) {
    return privateJson(base);
  }

  const mem = process.memoryUsage();
  return privateJson({
    ...base,
    uptime_seconds: Math.floor(process.uptime()),
    runtime: {
      node: process.version,
      platform: process.platform,
    },
    memory: {
      rss_mb: Math.round(mem.rss / 1024 / 1024),
      heap_used_mb: Math.round(mem.heapUsed / 1024 / 1024),
      heap_total_mb: Math.round(mem.heapTotal / 1024 / 1024),
    },
    deployment: {
      region: process.env.VERCEL_REGION ?? null,
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? null,
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_COMMIT_SHA ?? null,
    },
  });
}

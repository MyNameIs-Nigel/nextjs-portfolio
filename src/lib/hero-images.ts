import fs from "node:fs";
import path from "node:path";

// Server-only: reads the filesystem. Only import from Server Components.
const HERO_DIR = path.join(process.cwd(), "public", "hero");
const HERO_FILE = /^hero.*\.jpe?g$/i;
const FALLBACK = "/hero/hero1.jpg";

/**
 * The hero rotation pool: every `hero*.jpg` file in `public/hero`, sorted by
 * name and returned as web paths. Dropping a new `hero5.jpg` (etc.) into that
 * folder is all that's needed to add it to the rotation — no code change.
 */
export function getHeroImages(): string[] {
  try {
    return fs
      .readdirSync(HERO_DIR)
      .filter((file) => HERO_FILE.test(file))
      .sort()
      .map((file) => `/hero/${file}`);
  } catch {
    return [];
  }
}

/**
 * Deterministically picks one hero image per UTC day so the background rotates
 * daily. Computed on the server, so the correct image ships in the initial HTML
 * and `priority` preloads it — no post-load flash.
 */
export function getDailyHeroImage(now: number = Date.now()): string {
  const images = getHeroImages();
  if (images.length === 0) return FALLBACK;
  const dayIndex = Math.floor(now / 86_400_000) % images.length;
  return images[dayIndex];
}

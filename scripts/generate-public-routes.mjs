import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Discover public static pages from the actual route tree. Dynamic photo pages
// are added by sitemap.ts from published R2 records.
const routes = [];
async function walk(directory, segments = []) {
  const entries = await readdir(directory, { withFileTypes: true });
  if (entries.some((entry) => /^page\.(tsx|ts|jsx|js)$/.test(entry.name))) {
    routes.push(`/${segments.join("/")}`);
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || /^(blog|admin|api)$/.test(entry.name) || /^[\[_@]/.test(entry.name)) continue;
    await walk(path.join(directory, entry.name), entry.name.startsWith("(") ? segments : [...segments, entry.name]);
  }
}
await walk(path.resolve("src/app"));
await writeFile("src/lib/public-routes.json", `${JSON.stringify(routes.sort(), null, 2)}\n`);

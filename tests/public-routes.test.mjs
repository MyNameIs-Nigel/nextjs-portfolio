import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

test("sitemap discovers newly added public pages and excludes the blog, private and dynamic routes", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "photo-routes-"));
  try {
    await mkdir(path.join(root, "src/lib"), { recursive: true });
    for (const route of ["", "photos", "photos/[id]", "blog", "blog/[slug]", "admin/photos", "api/contact", "_private", "(public)/new-page"]) {
      const directory = path.join(root, "src/app", route);
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, "page.tsx"), "");
    }
    await promisify(execFile)(process.execPath, [path.resolve("scripts/generate-public-routes.mjs")], { cwd: root });
    assert.deepEqual(JSON.parse(await readFile(path.join(root, "src/lib/public-routes.json"), "utf8")), ["/", "/new-page", "/photos"]);
  } finally { await rm(root, { recursive: true, force: true }); }
});

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { setTimeout as wait } from "node:timers/promises";
import { startR2Fixture } from "./fixtures/r2-server.mjs";

const fixture = await startR2Fixture();
const port = process.env.PHOTO_TEST_PORT || "4310";
const origin = `http://localhost:${port}`;
const password = "integration-test-only-password-1234567890";
let output = "";
const app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--port", port], {
  env: { ...process.env, NODE_ENV: "development", SITE_URL: origin, PHOTO_ADMIN_PASSWORD: password, R2_ACCOUNT_ID: "test-account", R2_ACCESS_KEY_ID: "test-access-key", R2_SECRET_ACCESS_KEY: "test-secret-key", R2_BUCKET_NAME: "test-bucket", R2_PUBLIC_URL: fixture.origin, R2_LOCAL_ENDPOINT: fixture.origin, NEXT_TELEMETRY_DISABLED: "1" },
  stdio: ["ignore", "pipe", "pipe"],
});
app.stdout.on("data", (chunk) => { output = (output + chunk).slice(-12000); });
app.stderr.on("data", (chunk) => { output = (output + chunk).slice(-12000); });

async function api(path, data, { method = "POST", cookie, requestOrigin = origin } = {}) {
  return fetch(`${origin}${path}`, { method, headers: { "Content-Type": "application/json", Origin: requestOrigin, ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify(data) });
}

try {
  let ready = false;
  for (let attempt = 0; attempt < 90; attempt++) {
    if (app.exitCode !== null) throw new Error("Next.js exited before becoming ready.");
    try { if ((await fetch(`${origin}/robots.txt`)).ok) { ready = true; break; } } catch {}
    await wait(1000);
  }
  assert.equal(ready, true, "Next.js did not start");
  assert.equal((await api("/api/photos", { action: "prepare" })).status, 401);
  assert.equal((await api("/api/photos/session", { password }, { requestOrigin: "https://attacker.example" })).status, 403);
  assert.equal((await api("/api/photos/session", { password: "wrong" })).status, 401);
  const login = await api("/api/photos/session", { password });
  assert.equal(login.status, 200);
  const setCookie = login.headers.get("set-cookie");
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Strict/i);
  const cookie = setCookie.split(";")[0];
  assert.equal((await api("/api/photos", { action: "prepare" }, { cookie, requestOrigin: "https://attacker.example" })).status, 403);
  assert.equal((await api("/api/photos", { action: "prepare", title: "Bad photo" }, { cookie })).status, 400);

  const feed = await (await fetch(`${origin}/photos`)).text();
  assert.match(feed, /Morning fog/);
  assert.match(feed, /Older photos/);
  assert.doesNotMatch(feed, />Blog<\/a>/);
  const secondPage = await (await fetch(`${origin}/photos?page=2`)).text();
  assert.match(secondPage, /Newer photos/);
  assert.ok(secondPage.includes(`rel="canonical" href="${origin}/photos?page=2"`));
  assert.equal((await fetch(`${origin}/photos?page=999`)).status, 404);
  assert.equal((await fetch(`${origin}/photos?page=0`)).status, 404);
  const sitemapBefore = await (await fetch(`${origin}/sitemap.xml`)).text();
  assert.match(sitemapBefore, /image:image/);
  assert.doesNotMatch(sitemapBefore, /\/blog|\/admin/);
  assert.match(sitemapBefore, /photos\?page=2/);
  const admin = await fetch(`${origin}/admin/photos`);
  assert.match(admin.headers.get("x-robots-tag"), /noindex/);
  assert.match(await admin.text(), /Owner password/);

  const fields = { title: "Integration test photo", alt: "Morning fog above a grassy field", caption: "A caption with </script> text.", date: "2026-10-10", width: 1600, height: 1067 };
  const prepared = await api("/api/photos", { action: "prepare", contentType: "image/jpeg", ...fields }, { cookie });
  assert.equal(prepared.status, 200);
  const upload = await prepared.json();
  assert.match(upload.url, /X-Amz-Signature=/);
  assert.equal(new URL(upload.url).searchParams.get("X-Amz-Expires"), "300");
  assert.match(new URL(upload.url).searchParams.get("X-Amz-SignedHeaders"), /content-type/);
  const image = await readFile("public/original/fog.jpg");
  assert.equal((await fetch(upload.url, { method: "PUT", headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable" }, body: image })).status, 200);
  const published = await api("/api/photos", { action: "publish", id: upload.id, imageKey: upload.imageKey, ...fields }, { cookie });
  assert.equal(published.status, 201);
  const detail = await (await fetch(`${origin}/photos/${upload.id}`)).text();
  assert.match(detail, /Integration test photo/);
  assert.match(detail, /ImageObject/);
  assert.match(detail, /\\u003c\/script>/);
  assert.match(detail, new RegExp(`<meta property="og:image" content="${fixture.origin.replaceAll(".", "\\.")}/photos/images/${upload.id}\\.jpg"`));
  assert.match(await (await fetch(`${origin}/photos`)).text(), /Integration test photo/);
  assert.match(await (await fetch(`${origin}/sitemap.xml`)).text(), new RegExp(upload.id));
  assert.equal((await api("/api/photos", { id: upload.id }, { method: "DELETE" })).status, 401);
  assert.equal((await api("/api/photos", { id: upload.id }, { method: "DELETE", cookie })).status, 200);
  assert.equal(fixture.objects.has(upload.imageKey), false);
  assert.equal((await fetch(`${origin}/photos/${upload.id}`)).status, 404);
  assert.doesNotMatch(await (await fetch(`${origin}/sitemap.xml`)).text(), new RegExp(upload.id));

  // Film and undated photos publish without inventing a day or requiring EXIF.
  for (const [date, dateApproximate, label] of [["", false, ""], ["1998", false, "approx. 1998"], ["1998-06", false, "approx. June 1998"], ["1998-06-12", true, "approx. June 12, 1998"]]) {
    const film = { title: "Film archive", width: 1600, height: 1067, date, dateApproximate, exif: { camera: "Nikon F3", shutterSpeed: "1/125 s", aperture: "f/2.8", iso: "400", GPSLatitude: "secret-coordinate" } };
    const response = await api("/api/photos", { action: "prepare", contentType: "image/jpeg", ...film }, { cookie });
    assert.equal(response.status, 200);
    const signed = await response.json();
    assert.equal((await fetch(signed.url, { method: "PUT", headers: { "Content-Type": "image/jpeg" }, body: image })).status, 200);
    const publication = await api("/api/photos", { action: "publish", id: signed.id, imageKey: signed.imageKey, ...film }, { cookie });
    assert.equal(publication.status, 201);
    const { photo } = await publication.json();
    assert.equal(photo.date, date);
    assert.equal(photo.alt, "");
    assert.equal(photo.exif.GPSLatitude, undefined);
    const html = await (await fetch(`${origin}/photos/${signed.id}`)).text();
    assert.match(html, /alt="Film archive"/);
    assert.match(html, /Nikon F3/);
    assert.match(html, /1\/125 s/);
    assert.match(html, /ISO 400/);
    assert.doesNotMatch(html, /secret-coordinate/);
    assert.doesNotMatch(html, /"dateCreated":/);
    if (label) assert.ok(html.includes(label), label);
    else assert.doesNotMatch(html, /approx\./);
    assert.equal((await api("/api/photos", { id: signed.id }, { method: "DELETE", cookie })).status, 200);
  }

  const blog = await fetch(`${origin}/blog`);
  assert.equal(blog.status, 200);
  assert.doesNotMatch(await blog.text(), /name="robots" content="noindex/);
  assert.ok((await (await fetch(`${origin}/robots.txt`)).text()).includes(`Sitemap: ${origin}/sitemap.xml`));

  // Invalidate cached records, then simulate a storage outage. The journal can
  // recover without publishing an empty replacement sitemap during the outage.
  assert.equal((await api("/api/photos", { id: "00000000-0000-4000-8000-000000000012" }, { method: "DELETE", cookie })).status, 200);
  fixture.fail(true);
  assert.match(await (await fetch(`${origin}/photos`)).text(), /temporarily unavailable/);
  assert.equal((await fetch(`${origin}/sitemap.xml`)).status, 500);
  fixture.fail(false);
  assert.match(await (await fetch(`${origin}/photos`)).text(), /Morning fog/);
  const logout = await api("/api/photos/session", {}, { method: "DELETE", cookie });
  assert.match(logout.headers.get("set-cookie"), /Max-Age=0/);
  console.log("Integration checks passed: auth/CSRF, paginated R2 reads, signed upload, publishing, optional metadata, approximate film dates, public EXIF, sitemap refresh, removal, outage recovery, retained blog, and logout.");
  if (process.env.KEEP_PHOTO_PREVIEW === "1") {
    console.log(`Fixture preview: ${origin}/photos (test data only)`);
    await new Promise((resolve) => process.once("SIGTERM", resolve));
  }
} catch (error) {
  console.error(output);
  throw error;
} finally {
  app.kill("SIGTERM");
  await new Promise((resolve) => fixture.server.close(resolve));
}

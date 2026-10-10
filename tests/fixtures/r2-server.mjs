import http from "node:http";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

const xmlEscape = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");

// An in-memory S3-compatible fixture, never a real bucket. Signatures are not
// verified here; live credentials and Cloudflare's CORS remain deployment checks.
export async function startR2Fixture() {
  const objects = new Map();
  const images = [
    ["Morning fog", "fog.jpg", 1715, 2560, "A quiet morning, somewhere along the way."],
    ["America in the wind", "maxflag.jpg", 1706, 2560, "Late light and a moment between frames."],
    ["Cold streetlight", "streetlight.jpg", 1706, 2560, "The city keeps a little light for itself."],
  ];
  for (let index = 0; index < 12; index++) {
    const [title, file, width, height, caption] = images[index % images.length];
    const id = `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`;
    const imageKey = `photos/images/${id}.jpg`;
    const record = { id, imageKey, title: index < 3 ? title : `${title}, study ${index + 1}`, alt: title, caption, width, height, date: `2026-10-${String(10 - Math.floor(index / 2)).padStart(2, "0")}`, publishedAt: `2026-10-10T${String(23 - index).padStart(2, "0")}:00:00Z`, updatedAt: "2026-10-10T12:00:00Z" };
    objects.set(imageKey, { body: await readFile(`public/original/${file}`), type: "image/jpeg" });
    objects.set(`photos/entries/${id}.json`, { body: Buffer.from(JSON.stringify(record)), type: "application/json" });
  }
  let unavailable = false;
  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    response.setHeader("Access-Control-Allow-Origin", request.headers.origin || "*");
    response.setHeader("Access-Control-Allow-Headers", "content-type, cache-control");
    response.setHeader("Access-Control-Allow-Methods", "GET, HEAD, PUT, DELETE, OPTIONS");
    if (request.method === "OPTIONS") { response.writeHead(204).end(); return; }
    if (unavailable) { response.writeHead(503).end(); return; }
    const key = decodeURIComponent(url.pathname.replace(/^\/test-bucket\//, "").replace(/^\//, ""));
    if (url.searchParams.has("list-type")) {
      const keys = [...objects.keys()].filter((key) => key.startsWith(url.searchParams.get("prefix") || "")).sort();
      const offset = Number(url.searchParams.get("continuation-token") || 0);
      const entries = keys.slice(offset, offset + 7);
      const next = offset + 7 < keys.length ? offset + 7 : null;
      response.setHeader("Content-Type", "application/xml");
      response.end(`<ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Name>test-bucket</Name><IsTruncated>${!!next}</IsTruncated>${next ? `<NextContinuationToken>${next}</NextContinuationToken>` : ""}${entries.map((key) => `<Contents><Key>${xmlEscape(key)}</Key><LastModified>2026-10-10T12:00:00Z</LastModified><Size>${objects.get(key).body.length}</Size></Contents>`).join("")}</ListBucketResult>`);
      return;
    }
    if (request.method === "PUT") {
      if (request.headers["if-none-match"] === "*" && objects.has(key)) { response.writeHead(412).end(); return; }
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      objects.set(key, { body: Buffer.concat(chunks), type: request.headers["content-type"] || "application/octet-stream" });
      response.setHeader("ETag", `"${randomUUID()}"`);
      response.writeHead(200).end(); return;
    }
    if (request.method === "DELETE") { objects.delete(key); response.writeHead(204).end(); return; }
    const object = objects.get(key);
    if (!object) { response.writeHead(404).end("<Error><Code>NoSuchKey</Code></Error>"); return; }
    response.setHeader("Content-Type", object.type);
    response.setHeader("Content-Length", object.body.length);
    response.setHeader("ETag", '"fixture-object"');
    if (request.method === "HEAD") { response.writeHead(200).end(); return; }
    response.end(object.body);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { server, objects, origin: `http://localhost:${server.address().port}`, fail: (value) => { unavailable = value; } };
}

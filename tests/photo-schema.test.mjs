import test from "node:test";
import assert from "node:assert/strict";
import { parsePhoto, parsePhotoFields, sortPhotos, validDate, formatPhotoDate } from "../src/lib/photo-schema.ts";
import { jsonLd } from "../src/lib/site.ts";

const id = "e1fd1c57-281f-4e77-8c45-aa13af33d498";
const fields = { title: " Morning fog ", alt: "Fog over a field", caption: "", date: "2026-10-10", width: 2400, height: 1600 };
const photo = { ...fields, id, imageKey: `photos/images/${id}.webp`, publishedAt: "2026-10-10T12:00:00Z", updatedAt: "2026-10-10T12:00:00Z" };

test("photo metadata requires descriptive text, valid dates and bounded dimensions", () => {
  assert.equal(parsePhotoFields(fields).title, "Morning fog");
  for (const bad of [{ alt: " " }, { width: 0 }, { height: 3000 }, { width: 2.5 }, { date: "2026-02-30" }, { title: "x".repeat(161) }]) {
    assert.throws(() => parsePhotoFields({ ...fields, ...bad }));
  }
  assert.equal(validDate("2024-02-29"), true);
  assert.equal(validDate("2025-02-29"), false);
  assert.equal(formatPhotoDate("2026-10-10"), "October 10, 2026");
});

test("entries cannot reference arbitrary URLs or another photo's object", () => {
  assert.equal(parsePhoto(photo).id, id);
  assert.throws(() => parsePhoto({ ...photo, imageKey: "https://attacker.example/image.jpg" }));
  assert.throws(() => parsePhoto({ ...photo, imageKey: "photos/images/../../secret" }));
  assert.throws(() => parsePhoto({ ...photo, publishedAt: "invalid" }));
  assert.throws(() => parsePhoto({ ...photo, id: "../../secret" }));
});

test("journal order follows the photographed date with a stable publication tie-break", () => {
  const older = { ...photo, id: "older", date: "2025-01-01" };
  const recentUpload = { ...photo, id: "recent", publishedAt: "2026-10-10T13:00:00Z" };
  assert.deepEqual(sortPhotos([older, photo, recentUpload]).map((item) => item.id), ["recent", id, "older"]);
});

test("JSON-LD prevents captions from terminating the script element", () => {
  const payload = { caption: "</script><script>alert(1)</script>" };
  const encoded = jsonLd(payload);
  assert.equal(encoded.includes("<"), false);
  assert.deepEqual(JSON.parse(encoded), payload);
});

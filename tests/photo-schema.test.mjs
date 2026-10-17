import test from "node:test";
import assert from "node:assert/strict";
import { parsePhoto, parsePhotoFields, sortPhotos, validDate, formatPhotoDate, isPhotoType, photoImageKey, validImageKey, parsePageNumber, photoPagePath, photoPageCount, photosOnPage, PHOTO_PAGE_SIZE, MAX_PHOTO_EDGE } from "../src/lib/photo-schema.ts";
import { fullDate, isCalendarDate } from "../src/lib/dates.ts";
import { jsonLd } from "../src/lib/site.ts";

const id = "e1fd1c57-281f-4e77-8c45-aa13af33d498";
const fields = { title: " Morning fog ", alt: "Fog over a field", caption: "", date: "2026-10-10", width: 2400, height: 1600 };
const photo = { ...fields, id, imageKey: `photos/images/${id}.webp`, publishedAt: "2026-10-10T12:00:00Z", updatedAt: "2026-10-10T12:00:00Z" };

test("only the title is required from the owner; supplied dates and dimensions must be valid", () => {
  assert.equal(parsePhotoFields(fields).title, "Morning fog");
  for (const bad of [{ title: " " }, { width: 0 }, { height: 3000 }, { width: 2.5 }, { date: "2026-02-30" }, { date: "2026-13" }, { date: "26" }, { title: "x".repeat(161) }]) {
    assert.throws(() => parsePhotoFields({ ...fields, ...bad }));
  }
  assert.equal(validDate("2024-02-29"), true);
  assert.equal(validDate("2025-02-29"), false);
  assert.equal(formatPhotoDate("2026-10-10"), "October 10, 2026");
  const minimal = parsePhotoFields({ title: "Film", width: 1200, height: 800 });
  assert.equal(minimal.date, "");
  assert.equal(minimal.alt, "");
  assert.equal(minimal.caption, "");
  assert.deepEqual(minimal.exif, {});
  for (const date of ["1998", "1998-06", "1998-06-12"]) assert.equal(validDate(date), true);
  assert.equal(formatPhotoDate("1998"), "approx. 1998");
  assert.equal(formatPhotoDate("1998-06"), "approx. June 1998");
  assert.equal(formatPhotoDate("1998-06-12", true), "approx. June 12, 1998");
  assert.equal(formatPhotoDate(""), "");
  assert.equal(parsePhotoFields({ ...fields, date: "1998", dateApproximate: false }).dateApproximate, true);
  assert.equal(parsePhotoFields({ ...fields, dateApproximate: true }).dateApproximate, true);
  assert.equal(parsePhoto(photo).dateApproximate, false, "old records remain readable");
  assert.deepEqual(parsePhotoFields({ ...fields, exif: { camera: " Nikon F3 ", GPSLatitude: "secret", serialNumber: "secret" } }).exif, { camera: "Nikon F3" });
  assert.throws(() => parsePhotoFields({ ...fields, exif: { lens: "x".repeat(201) } }));
  assert.throws(() => parsePhotoFields({ ...fields, dateApproximate: "false" }));
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
  const yearOnly = { ...photo, id: "year", date: "2025" };
  const monthOnly = { ...photo, id: "month", date: "2025-06" };
  const undated = { ...photo, id: "undated", date: "", publishedAt: "2026-10-11T12:00:00Z" };
  assert.deepEqual(sortPhotos([yearOnly, older, monthOnly, undated]).map((item) => item.id), ["undated", "month", "older", "year"]);
});

test("JSON-LD prevents captions from terminating the script element", () => {
  const payload = { caption: "</script><script>alert(1)</script>" };
  const encoded = jsonLd(payload);
  assert.equal(encoded.includes("<"), false);
  assert.deepEqual(JSON.parse(encoded), payload);
});

test("partial dates pad to a real calendar day without timezone math", () => {
  assert.equal(fullDate("1998"), "1998-01-01");
  assert.equal(fullDate("1998-06"), "1998-06-01");
  assert.equal(fullDate("1998-06-12"), "1998-06-12");
  for (const date of ["2024-02-29", "1998-06", "1998"]) assert.equal(isCalendarDate(date), true, date);
  for (const date of ["2025-02-29", "2026-04-31", "1998-13", "1998-00"]) assert.equal(isCalendarDate(date), false, date);
});

test("only supported formats get an image key, and each key belongs to one photo", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp"]) assert.equal(isPhotoType(type), true, type);
  for (const type of ["image/gif", "image/heic", "toString", "", undefined, 42]) assert.equal(isPhotoType(type), false, String(type));
  assert.equal(photoImageKey(id, "image/jpeg"), `photos/images/${id}.jpg`);
  assert.equal(validImageKey(id, `photos/images/${id}.webp`), true);
  assert.equal(validImageKey(id, `photos/images/${id}.gif`), false);
  assert.equal(validImageKey(id, `photos/images/00000000-0000-4000-8000-000000000001.jpg`), false);
  assert.equal(validImageKey("../x", "photos/images/../x.jpg"), false);
  assert.equal(validImageKey(id, undefined), false);
  assert.throws(() => parsePhotoFields({ ...fields, width: MAX_PHOTO_EDGE + 1 }), new RegExp(`${MAX_PHOTO_EDGE} pixels`));
});

test("journal pages are 1-based, with the first page at the bare /photos path", () => {
  assert.equal(parsePageNumber(undefined), 1);
  assert.equal(parsePageNumber("3"), 3);
  for (const value of ["0", "-1", "01", "1.5", "two", "", ["1", "2"], "9".repeat(20)]) assert.equal(parsePageNumber(value), null, String(value));
  assert.equal(photoPagePath(1), "/photos");
  assert.equal(photoPagePath(2), "/photos?page=2");
  assert.equal(photoPageCount(0), 1, "an empty journal still has its first page");
  assert.equal(photoPageCount(PHOTO_PAGE_SIZE), 1);
  assert.equal(photoPageCount(PHOTO_PAGE_SIZE + 1), 2);
  const items = Array.from({ length: 25 }, (_, index) => index);
  assert.deepEqual(photosOnPage(items, 1), items.slice(0, 10));
  assert.deepEqual(photosOnPage(items, 3), [20, 21, 22, 23, 24]);
  assert.deepEqual(photosOnPage(items, 4), []);
});

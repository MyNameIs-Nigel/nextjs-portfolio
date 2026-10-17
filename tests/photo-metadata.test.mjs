import test from "node:test";
import assert from "node:assert/strict";
import { readPhotoMetadata, normalizePhotoMetadata, emptyPhotoMetadata } from "../src/lib/photo-metadata.ts";
import { jpegWithXmp, webpWithXmp, webp, riffChunk, tiffWithCamera } from "./fixtures/photo-metadata.mjs";

test("embedded XMP is extracted from JPEG and WebP before conversion", async () => {
  for (const bytes of [jpegWithXmp(), webpWithXmp()]) {
    const metadata = await readPhotoMetadata(new Blob([bytes]));
    assert.equal(metadata.title, "Summer on film");
    assert.equal(metadata.caption, "An evening in June.");
    assert.equal(metadata.date, "1998-06-12", "camera calendar day must not shift with timezone");
    assert.deepEqual(metadata.exif, { camera: "Nikon F3", lens: "50mm f/1.4", shutterSpeed: "1/125 s", aperture: "f/2.8", iso: "400", focalLength: "50 mm" });
  }
});

test("EXIF, IPTC, and XMP mappings preserve absence and only expose selected fields", () => {
  assert.deepEqual(normalizePhotoMetadata({}), emptyPhotoMetadata());
  const metadata = normalizePhotoMetadata({ ObjectName: "IPTC title", Caption: "IPTC caption", DateTimeOriginal: "2024:02:29 23:59:00", Make: "Canon", Model: "EOS R6", ExposureTime: 0.004, FNumber: 4, ISO: 800, LensModel: "RF 24-105mm", FocalLength: 35, GPSLatitude: 40, BodySerialNumber: "secret" });
  assert.equal(metadata.title, "IPTC title");
  assert.equal(metadata.caption, "IPTC caption");
  assert.equal(metadata.date, "2024-02-29");
  assert.equal(metadata.exif.camera, "Canon EOS R6");
  assert.equal(metadata.exif.shutterSpeed, "1/250 s");
  assert.equal(JSON.stringify(metadata).includes("secret"), false);
  assert.equal(JSON.stringify(metadata).includes("GPS"), false);
  assert.equal(normalizePhotoMetadata({ ModifyDate: "2024:01:01 12:00:00", CreateDate: "2024:01:01 12:00:00" }).date, "");
  assert.equal(normalizePhotoMetadata({ DateTimeOriginal: "0000:00:00 00:00:00" }).date, "");
  assert.equal(normalizePhotoMetadata({ DateCreated: "19980612" }).date, "1998-06-12");
  assert.equal(normalizePhotoMetadata({ DateCreated: "1998-06" }).date, "1998-06");
  assert.equal(normalizePhotoMetadata({ DateCreated: "1998" }).date, "1998");
  assert.equal(normalizePhotoMetadata({ XPTitle: " Windows title\0", ImageDescription: "EXIF description" }).title, "Windows title");
  assert.equal(normalizePhotoMetadata({ title: [{ lang: "fr", value: "Autre" }, { lang: "x-default", value: "Default" }] }).title, "Default");
  assert.equal(normalizePhotoMetadata({ exifEX: { LensModel: "Viltrox 27mm F1.2 E" } }).exif.lens, "Viltrox 27mm F1.2 E");
  assert.equal(normalizePhotoMetadata({ ExposureTime: 0.8 }).exif.shutterSpeed, "0.8 s");
});

test("WebP EXIF chunks are read, and a broken or truncated chunk never blocks publishing", async () => {
  const tiff = tiffWithCamera("FUJIFILM", "X-T5");
  const read = async (...chunks) => (await readPhotoMetadata(new Blob([webp(...chunks)]))).exif;
  assert.deepEqual(await read(riffChunk("EXIF", Buffer.concat([Buffer.from("Exif\0\0"), tiff]))), { camera: "FUJIFILM X-T5" });
  assert.deepEqual(await read(riffChunk("EXIF", tiff)), { camera: "FUJIFILM X-T5" }, "the Exif header is optional");
  assert.deepEqual(await read(riffChunk("EXIF", Buffer.from("Exif\0\0not a tiff")), riffChunk("EXIF", tiff)), { camera: "FUJIFILM X-T5" });
  assert.deepEqual(await read(riffChunk("EXIF", tiff, tiff.length + 100)), {}, "a chunk running past the file is ignored");
  assert.deepEqual(await readPhotoMetadata(new Blob([webp()])), emptyPhotoMetadata());
});

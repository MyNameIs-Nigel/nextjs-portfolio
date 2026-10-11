import type { CameraDetails } from "./photo-schema";

export type PhotoAutofill = { title: string; caption: string; alt: string; date: string; exif: CameraDetails };
export const emptyPhotoMetadata = (): PhotoAutofill => ({ title: "", caption: "", alt: "", date: "", exif: {} });

// XMP language alternatives may be strings, arrays, or { lang, value } objects.
function metadataText(value: unknown): string {
  if (typeof value === "string") return value.replace(/\0/g, "").trim();
  if (Array.isArray(value)) {
    const preferred = value.find((item) => item?.lang === "x-default") ?? value[0];
    return metadataText(preferred);
  }
  if (value && typeof value === "object") return metadataText((value as Record<string, unknown>).value);
  return "";
}

function firstText(tags: Record<string, unknown>, keys: string[], max: number) {
  for (const key of keys) {
    const value = metadataText(tags[key]);
    if (value) return value.slice(0, max);
  }
  return "";
}

function numeric(value: unknown): number | undefined {
  if (Array.isArray(value)) return numeric(value[0]);
  if (typeof value === "string" && /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/.test(value)) {
    const [numerator, denominator] = value.split("/").map(Number);
    return denominator && numerator / denominator || undefined;
  }
  if (typeof value !== "number" && typeof value !== "string") return;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

function captureDate(value: unknown) {
  const raw = metadataText(value);
  // Read the camera's calendar date without timezone conversion. Never use
  // file modification, digitization, or export timestamps as capture dates.
  const matched = /^(\d{4})(?:[:-]?(\d{2})(?:[:-]?(\d{2}))?)?(?=$|[T ])/u.exec(raw);
  if (!matched || Number(matched[1]) < 1000) return "";
  const date = [matched[1], matched[2], matched[3]].filter(Boolean).join("-");
  const full = date.length === 4 ? `${date}-01-01` : date.length === 7 ? `${date}-01` : date;
  const parsed = new Date(`${full}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === full ? date : "";
}

export function normalizePhotoMetadata(tags: Record<string, unknown>): PhotoAutofill {
  // Standalone XMP (including WebP chunks) is grouped by namespace.
  tags = Object.assign({}, ...["tiff", "exif", "exifEX", "aux", "photoshop", "Iptc4xmpCore", "Iptc4xmpExt", "dc"].map((key) => tags[key] && typeof tags[key] === "object" ? tags[key] : {}), tags);
  const result = emptyPhotoMetadata();
  result.title = firstText(tags, ["title", "Title", "ObjectName", "XPTitle", "Headline"], 160);
  result.caption = firstText(tags, ["description", "Description", "Caption", "Caption-Abstract", "ImageDescription", "XPComment", "UserComment"], 3000);
  result.alt = firstText(tags, ["AltTextAccessibility"], 500);
  result.date = captureDate(tags.DateTimeOriginal) || captureDate(tags.DateCreated);
  const make = firstText(tags, ["Make"], 200);
  const model = firstText(tags, ["Model"], 200);
  const camera = model.toLowerCase().startsWith(make.toLowerCase()) ? model : [make, model].filter(Boolean).join(" ");
  if (camera) result.exif.camera = camera.slice(0, 200);
  const lens = firstText(tags, ["LensModel", "Lens", "LensID"], 200);
  if (lens) result.exif.lens = lens;
  const exposure = numeric(tags.ExposureTime);
  const shutter = exposure ?? (typeof tags.ShutterSpeedValue === "number" && Number.isFinite(tags.ShutterSpeedValue) ? 2 ** -tags.ShutterSpeedValue : undefined);
  if (shutter && Number.isFinite(shutter) && shutter > 0) result.exif.shutterSpeed = shutter <= 0.5 ? `1/${Math.round(1 / shutter)} s` : `${Number(shutter.toFixed(3))} s`;
  const aperture = numeric(tags.FNumber) ?? (typeof tags.ApertureValue === "number" && Number.isFinite(tags.ApertureValue) ? 2 ** (tags.ApertureValue / 2) : undefined);
  if (aperture && Number.isFinite(aperture)) result.exif.aperture = `f/${Number(aperture.toFixed(1))}`;
  const iso = numeric(tags.ISO ?? tags.ISOSpeedRatings ?? tags.PhotographicSensitivity);
  if (iso) result.exif.iso = `${Math.round(iso)}`;
  const focal = numeric(tags.FocalLength);
  if (focal) result.exif.focalLength = `${Number(focal.toFixed(1))} mm`;
  return result;
}

export async function readPhotoMetadata(file: Blob): Promise<PhotoAutofill> {
  const { default: exifr } = await import("exifr");
  const options = { xmp: true, iptc: true, gps: false, makerNote: false, userComment: true, icc: false, reviveValues: false };
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const header = new TextDecoder().decode(bytes.slice(0, 12));
  if (header.startsWith("RIFF") && header.endsWith("WEBP")) {
    // exifr reads TIFF and XMP, but doesn't unwrap WebP's RIFF container.
    const tags: Record<string, unknown> = {};
    const view = new DataView(buffer);
    for (let offset = 12; offset + 8 <= bytes.length;) {
      const name = new TextDecoder().decode(bytes.slice(offset, offset + 4));
      const size = view.getUint32(offset + 4, true);
      const end = offset + 8 + size;
      if (end > bytes.length) break;
      let chunk = bytes.slice(offset + 8, end);
      try {
        if (name === "EXIF") {
          if (new TextDecoder().decode(chunk.slice(0, 6)) === "Exif\0\0") chunk = chunk.slice(6);
          Object.assign(tags, await exifr.parse(chunk, options));
        } else if (name === "XMP ") Object.assign(tags, await exifr.sidecar(chunk, options, "xmp"));
      } catch { /* A broken segment must not prevent manual publication. */ }
      offset = end + (size % 2);
    }
    return normalizePhotoMetadata(tags);
  }
  return normalizePhotoMetadata(await exifr.parse(bytes, options) ?? {});
}

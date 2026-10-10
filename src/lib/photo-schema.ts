export const PHOTO_PAGE_SIZE = 10;
export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
export const PHOTO_TYPES = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" } as const;
export const PHOTO_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export const CAMERA_FIELDS = { camera: "Camera", lens: "Lens", shutterSpeed: "Shutter speed", aperture: "Aperture", iso: "ISO", focalLength: "Focal length" } as const;
export type CameraDetails = Partial<Record<keyof typeof CAMERA_FIELDS, string>>;

export type Photo = {
  id: string;
  imageKey: string;
  title: string;
  alt: string;
  caption: string;
  date: string;
  dateApproximate: boolean;
  exif: CameraDetails;
  width: number;
  height: number;
  publishedAt: string;
  updatedAt: string;
};

export function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^[1-9]\d{3}(?:-\d{2}(?:-\d{2})?)?$/.test(value)) return false;
  const full = value.length === 4 ? `${value}-01-01` : value.length === 7 ? `${value}-01` : value;
  const date = new Date(`${full}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === full;
}

function text(value: unknown, name: string, max: number, required = true) {
  if (typeof value !== "string" || value.trim().length > max || (required && !value.trim())) {
    throw new Error(`${name} ${required ? "is required and " : ""}must be under ${max + 1} characters.`);
  }
  return value.trim();
}

export function parsePhotoFields(input: Record<string, unknown>) {
  const date = input.date == null ? "" : typeof input.date === "string" ? input.date.trim() : input.date;
  if (date !== "" && !validDate(date)) throw new Error("Use a valid year, year-month, or year-month-day for the photo date.");
  if (input.dateApproximate != null && typeof input.dateApproximate !== "boolean") throw new Error("Invalid approximate date setting.");
  if (input.exif != null && (typeof input.exif !== "object" || Array.isArray(input.exif))) throw new Error("Invalid camera details.");
  const exif: CameraDetails = {};
  for (const key of Object.keys(CAMERA_FIELDS) as (keyof CameraDetails)[]) {
    const value = text((input.exif as CameraDetails | undefined)?.[key] ?? "", CAMERA_FIELDS[key], 200, false);
    if (value) exif[key] = value;
  }
  const width = Number(input.width);
  const height = Number(input.height);
  if (![width, height].every((n) => Number.isInteger(n) && n > 0 && n <= 2560)) {
    throw new Error("Photo dimensions must be between 1 and 2560 pixels.");
  }
  return {
    title: text(input.title, "Title", 160),
    alt: text(input.alt ?? "", "Image description", 500, false),
    caption: text(input.caption ?? "", "Caption", 3000, false),
    date: date as string,
    dateApproximate: !!date && (date.length < 10 || input.dateApproximate === true),
    exif,
    width,
    height,
  };
}

export function parsePhoto(input: unknown): Photo {
  if (!input || typeof input !== "object") throw new Error("Invalid photo entry.");
  const value = input as Record<string, unknown>;
  if (typeof value.id !== "string" || !PHOTO_ID.test(value.id)) throw new Error("Invalid photo ID.");
  if (typeof value.imageKey !== "string" || !new RegExp(`^photos/images/${value.id}\\.(webp|jpg|png)$`).test(value.imageKey)) {
    throw new Error("Invalid photo image key.");
  }
  for (const key of ["publishedAt", "updatedAt"] as const) {
    if (typeof value[key] !== "string" || Number.isNaN(Date.parse(value[key]))) throw new Error("Invalid publication date.");
  }
  return {
    ...parsePhotoFields(value),
    id: value.id,
    imageKey: value.imageKey,
    publishedAt: value.publishedAt as string,
    updatedAt: value.updatedAt as string,
  };
}

export function sortPhotos(photos: Photo[]) {
  const key = (photo: Photo) => photo.date ? photo.date.length === 4 ? `${photo.date}-01-01` : photo.date.length === 7 ? `${photo.date}-01` : photo.date : photo.publishedAt.slice(0, 10);
  return photos.sort((a, b) => key(b).localeCompare(key(a)) || b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id));
}

export function formatPhotoDate(date: string, approximate = false) {
  if (!date) return "";
  if (date.length === 4) return `approx. ${date}`;
  const full = date.length === 7 ? `${date}-01` : date;
  const label = new Intl.DateTimeFormat("en-US", { month: "long", ...(date.length === 10 ? { day: "numeric" as const } : {}), year: "numeric", timeZone: "UTC" }).format(new Date(`${full}T12:00:00Z`));
  return `${date.length < 10 || approximate ? "approx. " : ""}${label}`;
}

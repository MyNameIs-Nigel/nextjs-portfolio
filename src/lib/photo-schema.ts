export const PHOTO_PAGE_SIZE = 10;
export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
export const PHOTO_TYPES = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" } as const;
export const PHOTO_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export type Photo = {
  id: string;
  imageKey: string;
  title: string;
  alt: string;
  caption: string;
  date: string;
  width: number;
  height: number;
  publishedAt: string;
  updatedAt: string;
};

export function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function text(value: unknown, name: string, max: number, required = true) {
  if (typeof value !== "string" || value.trim().length > max || (required && !value.trim())) {
    throw new Error(`${name} ${required ? "is required and " : ""}must be under ${max + 1} characters.`);
  }
  return value.trim();
}

export function parsePhotoFields(input: Record<string, unknown>) {
  if (!validDate(input.date)) throw new Error("Choose a valid photo date.");
  const width = Number(input.width);
  const height = Number(input.height);
  if (![width, height].every((n) => Number.isInteger(n) && n > 0 && n <= 2560)) {
    throw new Error("Photo dimensions must be between 1 and 2560 pixels.");
  }
  return {
    title: text(input.title, "Title", 160),
    alt: text(input.alt, "Image description", 500),
    caption: text(input.caption ?? "", "Caption", 3000, false),
    date: input.date,
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
  return photos.sort((a, b) => b.date.localeCompare(a.date) || b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id));
}

export function formatPhotoDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}

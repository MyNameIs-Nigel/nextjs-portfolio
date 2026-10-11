import {
  S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand,
  HeadObjectCommand, DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { MAX_PHOTO_BYTES, PHOTO_ID, PHOTO_TYPES, parsePhoto, parsePhotoFields, sortPhotos, type Photo } from "./photo-schema";

export const R2_ENV = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "R2_PUBLIC_URL"] as const;

export function missingR2Settings() {
  return R2_ENV.filter((key) => !process.env[key]);
}

function storage() {
  if (missingR2Settings().length) throw new Error("R2 is not configured.");
  const publicUrl = new URL(process.env.R2_PUBLIC_URL!);
  if (publicUrl.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && publicUrl.hostname === "localhost")) {
    throw new Error("R2_PUBLIC_URL must use HTTPS.");
  }
  return {
    bucket: process.env.R2_BUCKET_NAME!,
    client: new S3Client({
      region: "auto",
      endpoint: process.env.NODE_ENV !== "production" && process.env.R2_LOCAL_ENDPOINT
        ? process.env.R2_LOCAL_ENDPOINT
        : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      forcePathStyle: true,
      credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
      maxAttempts: 2,
      requestHandler: { requestTimeout: 10000, connectionTimeout: 3000 },
    }),
  };
}

export function photoImageUrl(photo: Photo) {
  const base = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");
  return `${base}/${photo.imageKey.split("/").map(encodeURIComponent).join("/")}`;
}

const entryKey = (id: string) => `photos/entries/${id}.json`;

export async function readPhotos(): Promise<Photo[]> {
  if (missingR2Settings().length === R2_ENV.length) return [];
  const { client, bucket } = storage();
  const keys: string[] = [];
  let cursor: string | undefined;
  do {
    const result = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: "photos/entries/", ContinuationToken: cursor }));
    for (const item of result.Contents ?? []) {
      const id = item.Key?.slice("photos/entries/".length, -5);
      if (item.Key?.endsWith(".json") && id && PHOTO_ID.test(id)) keys.push(item.Key);
    }
    cursor = result.IsTruncated ? result.NextContinuationToken : undefined;
    if (result.IsTruncated && !cursor) throw new Error("R2 returned an incomplete listing.");
  } while (cursor);

  const photos: Photo[] = [];
  // Keep request concurrency bounded for larger journals.
  for (let index = 0; index < keys.length; index += 8) {
    const batch = await Promise.all(keys.slice(index, index + 8).map(async (key) => {
      const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      if (!result.Body || (result.ContentLength ?? 0) > 16384) throw new Error("Invalid photo entry size.");
      const photo = parsePhoto(JSON.parse(await result.Body.transformToString()));
      if (entryKey(photo.id) !== key) throw new Error("Photo entry ID mismatch.");
      return photo;
    }));
    photos.push(...batch);
  }
  return sortPhotos(photos);
}

export const getPhotos = unstable_cache(readPhotos, ["r2-photo-journal-v2-metadata", process.env.R2_BUCKET_NAME ?? "unconfigured", process.env.R2_PUBLIC_URL ?? "unconfigured"], { revalidate: 300, tags: ["photos"] });

export const getPhotoStream = cache(async () => {
  try {
    return { photos: await getPhotos(), status: "ready" as const };
  } catch {
    console.error("The R2 photo journal could not be loaded. Check bucket credentials and connectivity.");
    return { photos: [] as Photo[], status: "unavailable" as const };
  }
});

export async function prepareUpload(contentType: string) {
  if (!Object.hasOwn(PHOTO_TYPES, contentType)) throw new Error("Upload a JPEG, PNG, or WebP image.");
  const { client, bucket } = storage();
  const id = randomUUID();
  const imageKey = `photos/images/${id}.${PHOTO_TYPES[contentType as keyof typeof PHOTO_TYPES]}`;
  const url = await getSignedUrl(client, new PutObjectCommand({
    Bucket: bucket, Key: imageKey, ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  }), { expiresIn: 300, signableHeaders: new Set(["content-type"]) });
  return { id, imageKey, url };
}

export async function publishPhoto(input: Record<string, unknown>) {
  const fields = parsePhotoFields(input);
  const id = input.id;
  if (typeof id !== "string" || !PHOTO_ID.test(id)) throw new Error("Invalid upload ID.");
  const imageKey = input.imageKey;
  if (typeof imageKey !== "string" || !new RegExp(`^photos/images/${id}\\.(webp|jpg|png)$`).test(imageKey)) throw new Error("Invalid image key.");
  const { client, bucket } = storage();
  const uploaded = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: imageKey }));
  if (!uploaded.ContentLength || uploaded.ContentLength > MAX_PHOTO_BYTES || !uploaded.ContentType || !Object.hasOwn(PHOTO_TYPES, uploaded.ContentType)) {
    throw new Error("The uploaded image is missing, too large, or has an unsupported format.");
  }
  const timestamp = new Date().toISOString();
  const photo: Photo = { ...fields, id, imageKey, publishedAt: timestamp, updatedAt: timestamp };
  await client.send(new PutObjectCommand({
    Bucket: bucket, Key: entryKey(id), Body: JSON.stringify(photo),
    ContentType: "application/json", CacheControl: "no-store", IfNoneMatch: "*",
  }));
  return photo;
}

export async function deletePhoto(id: string) {
  if (!PHOTO_ID.test(id)) throw new Error("Invalid photo ID.");
  const { client, bucket } = storage();
  const entry = await client.send(new GetObjectCommand({ Bucket: bucket, Key: entryKey(id) }));
  if (!entry.Body) throw new Error("Photo not found.");
  const photo = parsePhoto(JSON.parse(await entry.Body.transformToString()));
  if (photo.id !== id) throw new Error("Photo entry ID mismatch.");
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: entryKey(id) }));
  // Once the record is gone, invalidate the journal even if image cleanup fails.
  // A retry must not leave a cached entry pointing at a removed record.
  try { await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: photo.imageKey })); }
  catch { console.error("The photo was unpublished, but its unlisted R2 image needs cleanup."); }
}

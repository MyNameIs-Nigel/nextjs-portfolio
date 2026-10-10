import type { MetadataRoute } from "next";
import publicRoutes from "@/lib/public-routes.json";
import { getPhotos, photoImageUrl } from "@/lib/r2";
import { PHOTO_PAGE_SIZE } from "@/lib/photo-schema";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const photos = await getPhotos();
  const latest = photos.reduce<string | undefined>((date, photo) => !date || photo.updatedAt > date ? photo.updatedAt : date, undefined);
  const entries: MetadataRoute.Sitemap = publicRoutes.map((route) => ({
    url: absoluteUrl(route),
    ...(route === "/photos" ? { lastModified: latest, images: photos.slice(0, PHOTO_PAGE_SIZE).map(photoImageUrl) } : {}),
  }));
  for (let start = PHOTO_PAGE_SIZE; start < photos.length; start += PHOTO_PAGE_SIZE) {
    const page = Math.floor(start / PHOTO_PAGE_SIZE) + 1;
    entries.push({ url: absoluteUrl(`/photos?page=${page}`), images: photos.slice(start, start + PHOTO_PAGE_SIZE).map(photoImageUrl), lastModified: latest });
  }
  return [...entries, ...photos.map((photo) => ({ url: absoluteUrl(`/photos/${photo.id}`), lastModified: photo.updatedAt, images: [photoImageUrl(photo)] }))];
}

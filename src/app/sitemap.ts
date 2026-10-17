import type { MetadataRoute } from "next";
import publicRoutes from "@/lib/public-routes.json";
import { getPhotos, photoImageUrl } from "@/lib/r2";
import { photoPageCount, photoPagePath, photosOnPage } from "@/lib/photo-schema";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const photos = await getPhotos();
  const latest = photos.reduce<string | undefined>((date, photo) => !date || photo.updatedAt > date ? photo.updatedAt : date, undefined);
  // Each journal page lists the images it shows; page 1 is the discovered /photos route.
  const journalPages = Array.from({ length: photoPageCount(photos.length) }, (_, index) => ({
    url: absoluteUrl(photoPagePath(index + 1)),
    lastModified: latest,
    images: photosOnPage(photos, index + 1).map(photoImageUrl),
  }));
  return [
    ...publicRoutes.filter((route) => route !== photoPagePath(1)).map((route) => ({ url: absoluteUrl(route) })),
    ...journalPages,
    ...photos.map((photo) => ({ url: absoluteUrl(`/photos/${photo.id}`), lastModified: photo.updatedAt, images: [photoImageUrl(photo)] })),
  ];
}

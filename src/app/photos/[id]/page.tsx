import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PhotoFigure from "@/components/PhotoFigure";
import { getPhotoStream, photoImageUrl } from "@/lib/r2";
import { absoluteUrl, jsonLd } from "@/lib/site";
import { PHOTO_ID } from "@/lib/photo-schema";

export const revalidate = 300;
type Props = { params: Promise<{ id: string }> };
async function findPhoto(id: string) {
  if (!PHOTO_ID.test(id)) notFound();
  const { photos, status } = await getPhotoStream();
  const photo = photos.find((item) => item.id === id);
  // During an outage the photo is unknown rather than missing, so keep the URL alive.
  if (!photo && status === "ready") notFound();
  return photo;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const photo = await findPhoto((await params).id);
  if (!photo) return { title: "Photo Journal — Nigel Smith" };
  const title = `${photo.title} — Nigel Smith`;
  const description = photo.caption || photo.alt;
  const images = [{ url: photoImageUrl(photo), width: photo.width, height: photo.height, alt: photo.alt }];
  return {
    title, description, alternates: { canonical: `/photos/${photo.id}` },
    openGraph: { title, description, url: `/photos/${photo.id}`, type: "article", publishedTime: photo.publishedAt, modifiedTime: photo.updatedAt, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function PhotoPage({ params }: Props) {
  const photo = await findPhoto((await params).id);
  if (!photo) return <>
    <Navbar />
    <main id="main-content" className="mx-auto min-h-screen max-w-7xl px-6 pb-24 pt-32 lg:px-12 lg:pt-40">
      <Link href="/photos" className="mb-10 inline-block text-sm text-muted hover:text-accent">← Back to the journal</Link>
      <div className="flex min-h-72 flex-col items-center justify-center border-y border-border px-6 py-16 text-center">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl">A moment, please.</h1>
        <p className="mt-4 max-w-sm leading-relaxed text-muted">This photograph is temporarily unavailable. Please check back shortly.</p>
      </div>
    </main>
    <Footer />
  </>;
  return <>
    <Navbar />
    <main id="main-content" className="mx-auto min-h-screen max-w-7xl px-6 pb-24 pt-32 lg:px-12 lg:pt-40">
      <Link href="/photos" className="mb-10 inline-block text-sm text-muted hover:text-accent">← Back to the journal</Link>
      <PhotoFigure photo={photo} priority detail />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
        "@context": "https://schema.org", "@type": "ImageObject", "@id": absoluteUrl(`/photos/${photo.id}`),
        url: absoluteUrl(`/photos/${photo.id}`), contentUrl: photoImageUrl(photo), name: photo.title, description: photo.alt,
        caption: photo.caption || undefined, dateCreated: photo.date, datePublished: photo.publishedAt, dateModified: photo.updatedAt,
        width: photo.width, height: photo.height,
        creator: { "@type": "Person", name: "Nigel Smith", url: absoluteUrl("/") }, creditText: "Nigel Smith", copyrightNotice: "© Nigel Smith",
      }) }} />
    </main>
    <Footer />
  </>;
}

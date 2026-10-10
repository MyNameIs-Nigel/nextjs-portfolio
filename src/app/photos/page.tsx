import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PhotoFigure from "@/components/PhotoFigure";
import { getPhotoStream, photoImageUrl } from "@/lib/r2";
import { PHOTO_PAGE_SIZE } from "@/lib/photo-schema";
import { absoluteUrl, jsonLd } from "@/lib/site";

type Props = { searchParams: Promise<{ page?: string | string[] }> };
function pageNumber(value: string | string[] | undefined) {
  if (value === undefined) return 1;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) return null;
  return Number(value);
}
const pagePath = (page: number) => page === 1 ? "/photos" : `/photos?page=${page}`;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = pageNumber((await searchParams).page) ?? 1;
  const title = page === 1 ? "Photo Journal — Nigel Smith" : `Photo Journal, Page ${page} — Nigel Smith`;
  const description = "An ongoing photo journal by Nigel Smith. New photographs, small observations, and moments worth keeping, in digital and on film.";
  return {
    title, description, alternates: { canonical: pagePath(page) },
    openGraph: { title, description, url: pagePath(page), type: "website", images: [absoluteUrl("/opengraph-image.jpg")] },
    twitter: { card: "summary_large_image", title, description, images: [absoluteUrl("/opengraph-image.jpg")] },
  };
}

export default async function PhotosPage({ searchParams }: Props) {
  const query = await searchParams;
  const page = pageNumber(query.page);
  if (page === null) notFound();
  if (query.page === "1") redirect("/photos");
  const { photos, status } = await getPhotoStream();
  const pages = Math.max(1, Math.ceil(photos.length / PHOTO_PAGE_SIZE));
  if (page > pages && status === "ready") notFound();
  const visible = photos.slice((page - 1) * PHOTO_PAGE_SIZE, page * PHOTO_PAGE_SIZE);
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen">
        <header className="mx-auto max-w-7xl px-6 pb-14 pt-36 lg:px-12 lg:pb-20 lg:pt-44">
          <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-accent"><span className="h-px w-10 bg-accent" /> An ongoing collection</div>
          <h1 className="mt-5 font-[family-name:var(--font-playfair)] text-5xl tracking-tight sm:text-7xl lg:text-8xl">Photo journal<span className="text-accent">.</span></h1>
          <div className="mt-7 flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
            <p className="max-w-md text-lg leading-relaxed text-muted">New photographs, small observations,<br className="hidden sm:block" /> and moments worth keeping.</p>
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Digital &amp; film <span className="mx-2 text-border">/</span> Newest first</p>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-12 lg:pb-32">
          {visible.length > 0 ? (
            <div className="space-y-20 lg:space-y-28">{visible.map((photo, index) => <PhotoFigure key={photo.id} photo={photo} priority={index === 0} />)}</div>
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center border-y border-border px-6 py-16 text-center">
              <span className="mb-6 font-[family-name:var(--font-playfair)] text-5xl text-stone-300" aria-hidden="true">↗</span>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl">{status === "unavailable" ? "A moment, please." : "A new chapter is coming."}</h2>
              <p className="mt-4 max-w-sm leading-relaxed text-muted">{status === "unavailable" ? "The journal is temporarily unavailable. Please check back shortly." : "The first entries will be here soon. In the meantime, explore a few favorites from my portfolio."}</p>
              <Link href="/#work" className="mt-7 border-b border-accent pb-1 text-sm font-medium text-accent">Explore selected work <span aria-hidden="true">↗</span></Link>
            </div>
          )}
          {pages > 1 && <nav aria-label="Photo journal pages" className="mt-20 flex items-center justify-between border-t border-border pt-8 text-sm">
            {page > 1 ? <Link href={pagePath(page - 1)} className="hover:text-accent">← Newer photos</Link> : <span />}
            <span className="text-muted">{page} / {pages}</span>
            {page < pages ? <Link href={pagePath(page + 1)} className="hover:text-accent">Older photos →</Link> : <span />}
          </nav>}
          <div className="mt-24 flex items-center justify-between border-t border-border pt-6 text-xs uppercase tracking-[0.15em] text-muted"><span>Seen through my eyes</span><Link href="/#contact" className="hover:text-accent">Let’s make something ↗</Link></div>
        </div>
        {visible.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
          "@context": "https://schema.org", "@type": "CollectionPage", name: "Photo Journal — Nigel Smith", url: absoluteUrl(pagePath(page)),
          mainEntity: { "@type": "ItemList", itemListElement: visible.map((photo, index) => ({
            "@type": "ListItem", position: (page - 1) * PHOTO_PAGE_SIZE + index + 1, url: absoluteUrl(`/photos/${photo.id}`), name: photo.title,
            image: photoImageUrl(photo),
          })) },
        }) }} />}
      </main>
      <Footer />
    </>
  );
}

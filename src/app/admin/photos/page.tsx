import type { Metadata } from "next";
import Link from "next/link";
import { PhotoLogin, PhotoUploader } from "@/components/PhotoAdmin";
import { isPhotoAdmin } from "@/lib/photo-auth";
import { adminPassword } from "@/lib/photo-session";
import { missingR2Settings, readPhotos, photoImageUrl } from "@/lib/r2";
import type { Photo } from "@/lib/photo-schema";

export const metadata: Metadata = { title: "Photo Studio — Nigel Smith", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PhotoAdminPage() {
  const configured = !!adminPassword();
  const authorized = configured && await isPhotoAdmin();
  const missing = missingR2Settings();
  let photos: Photo[] = [];
  let loadFailed = false;
  if (authorized && !missing.length) {
    try { photos = await readPhotos(); }
    catch { loadFailed = true; }
  }
  return <main id="main-content" className="mx-auto min-h-screen max-w-4xl px-6 py-10 sm:py-14">
    <div className="mb-14 flex items-center justify-between border-b border-border pb-6"><Link href="/" className="font-[family-name:var(--font-playfair)] text-xl font-bold">Nigel Smith</Link><Link href="/photos" className="text-sm text-muted hover:text-accent">View journal ↗</Link></div>
    {!configured ? <div className="mx-auto max-w-lg rounded-2xl border border-border bg-white p-8"><p className="text-xs uppercase tracking-[0.2em] text-accent">Photo studio</p><h1 className="mt-4 font-[family-name:var(--font-playfair)] text-3xl">One step before your first entry.</h1><p className="mt-5 leading-relaxed text-muted">Set PHOTO_ADMIN_PASSWORD to a random password of at least 32 characters in your deployment environment, then redeploy. The setup guide is in docs/PHOTO-JOURNAL.md.</p></div> : authorized ? <PhotoUploader photos={photos.map((photo) => ({ ...photo, imageUrl: photoImageUrl(photo) }))} missingSettings={missing} loadFailed={loadFailed} /> : <PhotoLogin />}
  </main>;
}
